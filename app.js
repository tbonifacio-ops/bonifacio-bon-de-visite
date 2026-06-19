class VisitCertificateApp {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.visitHistory = [];
        this.currentLocation = null;
        this.lastLocationUpdate = null;
        this.gdprAccepted = false;
        
        this.initializeApp();
    }

    initializeApp() {
        // Check for notch support
        if (navigator.userAgentData?.mobile || /iPhone|iPad|Android/i.test(navigator.userAgent)) {
            document.body.classList.add('has-notch');
        }

        // GDPR
        const gdprAccepted = localStorage.getItem('gdprAccepted');
        if (gdprAccepted && JSON.parse(gdprAccepted).accepted) {
            this.gdprAccepted = true;
            this.showScreen('mainScreen');
        }

        // Setup GDPR
        document.getElementById('gdprConsent').addEventListener('change', (e) => {
            document.getElementById('acceptGdpr').disabled = !e.target.checked;
        });

        document.getElementById('acceptGdpr').addEventListener('click', () => {
            localStorage.setItem('gdprAccepted', JSON.stringify({
                accepted: true,
                date: new Date().toISOString(),
                retention_months: 24
            }));
            this.gdprAccepted = true;
            this.showScreen('mainScreen');
            this.initializeMainScreen();
        });

        // Load history
        this.loadHistory();

        // Setup main screen
        if (this.gdprAccepted) {
            this.initializeMainScreen();
        }
    }

    initializeMainScreen() {
        // Canvas setup
        this.canvas = document.getElementById('signaturePad');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Signature events
        this.canvas.addEventListener('pointerdown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('pointermove', (e) => this.draw(e));
        this.canvas.addEventListener('pointerup', () => this.stopDrawing());
        this.canvas.addEventListener('pointercancel', () => this.stopDrawing());
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());

        document.getElementById('clearSignature').addEventListener('click', () => {
            this.clearCanvas();
        });

        // Geolocation
        this.requestGeolocation();

        // Form submission
        document.getElementById('generatePdf').addEventListener('click', () => this.generatePDF());

        // History navigation
        document.getElementById('viewHistory').addEventListener('click', () => this.showScreen('historyScreen'));
        document.getElementById('backToMain').addEventListener('click', () => this.showScreen('mainScreen'));
        document.getElementById('clearHistory').addEventListener('click', () => this.clearAllHistory());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = container.clientWidth;
        this.canvas.height = 150;

        // Draw border
        this.ctx.strokeStyle = '#E5DDD0';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    startDrawing(e) {
        if (!this.gdprAccepted) {
            this.showStatus('Vous devez accepter les conditions GDPR', 'error');
            return;
        }

        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#2a2a2a';
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.closePath();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Redraw border
        this.ctx.strokeStyle = '#E5DDD0';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    requestGeolocation() {
        if ('geolocation' in navigator) {
            document.getElementById('locationInfo').style.display = 'block';

            navigator.geolocation.watchPosition(
                (position) => {
                    this.currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };
                    this.lastLocationUpdate = new Date();

                    const lat = position.coords.latitude.toFixed(6);
                    const lng = position.coords.longitude.toFixed(6);
                    const acc = Math.round(position.coords.accuracy);

                    document.getElementById('coordsDisplay').textContent = `${lat}°N, ${lng}°E`;
                    document.getElementById('accuracyDisplay').textContent = `±${acc}m`;
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    document.getElementById('coordsDisplay').textContent = 'Non disponible';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    }

    validateForm() {
        const address = document.getElementById('propertyAddress').value.trim();
        const visitorName = document.getElementById('visitorName').value.trim();
        const signatureEmpty = this.isCanvasEmpty();

        if (!address) {
            this.showStatus('Veuillez entrer une adresse', 'error');
            return false;
        }

        if (!visitorName) {
            this.showStatus('Veuillez entrer un nom', 'error');
            return false;
        }

        if (signatureEmpty) {
            this.showStatus('Veuillez signer', 'error');
            return false;
        }

        if (!this.gdprAccepted) {
            this.showStatus('Vous devez accepter les conditions GDPR', 'error');
            return false;
        }

        return true;
    }

    isCanvasEmpty() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        return imageData.data.every((val, i) => {
            if (i % 4 === 3) return true; // Skip alpha channel
            return val === 0; // Check if pixel is black
        });
    }

    async generatePDF() {
        if (!this.validateForm()) return;

        this.showStatus('Génération en cours...', 'info');
        document.getElementById('generatePdf').disabled = true;

        try {
            // Wait for jsPDF to load
            if (typeof window.jsPDF === 'undefined') {
                throw new Error('jsPDF library not loaded');
            }

            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF('p', 'mm', 'a4');

            // Colors matching brand
            const gold = [168, 137, 91];
            const darkText = [42, 42, 42];
            const lightBg = [248, 245, 240];

            // Set background
            doc.setFillColor(...lightBg);
            doc.rect(0, 0, 210, 297, 'F');

            // Header border
            doc.setDrawColor(...gold);
            doc.setLineWidth(0.5);
            doc.line(10, 25, 200, 25);

            // Title
            doc.setFontSize(24);
            doc.setTextColor(...gold);
            doc.setFont('times', 'bold');
            doc.text('CERTIFICAT DE VISITE', 105, 20, { align: 'center' });

            // Agency branding
            doc.setFontSize(10);
            doc.setTextColor(...darkText);
            doc.setFont('times', 'normal');
            doc.text('Bonifacio & Fils Immobilier', 105, 30, { align: 'center' });

            // Reference & Date
            const refNum = 'REF-' + Date.now().toString().slice(-8);
            const now = new Date();
            const dateStr = now.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const timeStr = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            doc.setFontSize(9);
            doc.text(`Référence: ${refNum}`, 15, 35);
            doc.text(`Date: ${dateStr}`, 15, 40);
            doc.text(`Heure: ${timeStr}`, 15, 45);

            // Main content
            doc.setFontSize(11);
            doc.setTextColor(...darkText);
            doc.setFont('times', 'bold');
            doc.text('LIEU DE LA VISITE', 15, 55);

            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.text(document.getElementById('propertyAddress').value, 15, 62, { maxWidth: 180 });

            // Visitor info
            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            doc.text('VISITEUR / CLIENT', 15, 80);

            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            const visitorInfo = [
                `Nom: ${document.getElementById('visitorName').value}`,
                document.getElementById('visitorPhone').value ? `Téléphone: ${document.getElementById('visitorPhone').value}` : null
            ].filter(Boolean);
            let yPos = 87;
            visitorInfo.forEach(line => {
                doc.text(line, 15, yPos);
                yPos += 6;
            });

            // Location (GPS)
            yPos += 5;
            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            doc.text('LOCALISATION', 15, yPos);
            yPos += 7;

            doc.setFont('times', 'normal');
            doc.setFontSize(9);
            if (this.currentLocation) {
                doc.text(`GPS: ${this.currentLocation.latitude.toFixed(6)}°, ${this.currentLocation.longitude.toFixed(6)}°`, 15, yPos);
                yPos += 5;
                doc.text(`Précision: ±${Math.round(this.currentLocation.accuracy)}m`, 15, yPos);
            } else {
                doc.text('GPS: Non disponible', 15, yPos);
            }

            // Signature section
            yPos += 12;
            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            doc.text('SIGNATURE', 15, yPos);
            yPos += 10;

            // Add signature canvas as image
            const signatureImg = this.canvas.toDataURL('image/png');
            const imgWidth = 170;
            const imgHeight = (imgWidth * this.canvas.height) / this.canvas.width;
            doc.addImage(signatureImg, 'PNG', 20, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 8;

            // Notes if any
            const notes = document.getElementById('notes').value.trim();
            if (notes) {
                doc.setFont('times', 'bold');
                doc.setFontSize(11);
                doc.text('REMARQUES', 15, yPos);
                yPos += 7;

                doc.setFont('times', 'normal');
                doc.setFontSize(9);
                doc.text(notes, 15, yPos, { maxWidth: 180 });
            }

            // Footer - GDPR compliance
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text('Données traitées conformément au RGPD - CNIL - Retention 24 mois', 105, 290, { align: 'center' });

            // Agency details - footer
            doc.setFontSize(7);
            doc.text('SIREN 904719879 | CPI 9401 2022 000 000 038 | RCP Verspieren', 105, 294, { align: 'center' });

            // Save PDF
            doc.save(`BonDeVisite_${refNum}.pdf`);

            // Save to history
            this.addToHistory({
                reference: refNum,
                address: document.getElementById('propertyAddress').value,
                visitorName: document.getElementById('visitorName').value,
                date: now.toISOString(),
                location: this.currentLocation,
                timestamp: now.getTime()
            });

            // Reset form
            this.resetForm();
            this.showStatus('PDF généré avec succès!', 'success');

        } catch (error) {
            console.error('PDF generation error:', error);
            this.showStatus('Erreur lors de la génération du PDF', 'error');
        } finally {
            document.getElementById('generatePdf').disabled = false;
        }
    }

    resetForm() {
        document.getElementById('propertyAddress').value = '';
        document.getElementById('visitorName').value = '';
        document.getElementById('visitorPhone').value = '';
        document.getElementById('notes').value = '';
        this.clearCanvas();
    }

    addToHistory(visit) {
        this.visitHistory.push(visit);
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    saveHistory() {
        localStorage.setItem('visitHistory', JSON.stringify(this.visitHistory));
        this.cleanOldRecords();
    }

    loadHistory() {
        const stored = localStorage.getItem('visitHistory');
        if (stored) {
            this.visitHistory = JSON.parse(stored);
            this.cleanOldRecords();
        }
    }

    cleanOldRecords() {
        const now = Date.now();
        const retentionMs = 24 * 30 * 24 * 60 * 60 * 1000; // ~24 months
        
        this.visitHistory = this.visitHistory.filter(visit => {
            return (now - visit.timestamp) < retentionMs;
        });
        
        this.saveHistory();
    }

    updateHistoryDisplay() {
        const list = document.getElementById('historyList');
        
        if (this.visitHistory.length === 0) {
            list.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #999;">Aucune visite enregistrée</div>';
            return;
        }

        list.innerHTML = this.visitHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((visit, index) => {
                const date = new Date(visit.date);
                const dateStr = date.toLocaleDateString('fr-FR');
                const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                return `
                    <div class="history-item">
                        <div class="history-item-date">${dateStr} à ${timeStr}</div>
                        <div class="history-item-title">${visit.visitorName}</div>
                        <div class="history-item-address">${visit.address}</div>
                        <div style="font-size: 11px; color: #aaa; margin-top: 5px;">${visit.reference}</div>
                        <div class="history-item-actions">
                            <button class="btn-secondary" onclick="app.downloadPDFFromHistory(${index})">Re-télécharger</button>
                            <button class="btn-danger" onclick="app.deleteHistoryItem(${index})">Supprimer</button>
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    deleteHistoryItem(index) {
        if (confirm('Êtes-vous sûr?')) {
            this.visitHistory.splice(index, 1);
            this.saveHistory();
            this.updateHistoryDisplay();
            this.showStatus('Entrée supprimée', 'success', 'status-history');
        }
    }

    clearAllHistory() {
        if (confirm('Supprimer tout l\'historique? Cette action est irréversible.')) {
            this.visitHistory = [];
            this.saveHistory();
            this.updateHistoryDisplay();
            this.showStatus('Historique vidé', 'success', 'status-history');
        }
    }

    downloadPDFFromHistory(index) {
        this.showStatus('Génération en cours...', 'info', 'status-history');
        const visit = this.visitHistory[index];
        
        try {
            if (typeof window.jsPDF === 'undefined') {
                throw new Error('jsPDF library not loaded');
            }

            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF('p', 'mm', 'a4');

            const gold = [168, 137, 91];
            const darkText = [42, 42, 42];
            const lightBg = [248, 245, 240];

            doc.setFillColor(...lightBg);
            doc.rect(0, 0, 210, 297, 'F');

            doc.setDrawColor(...gold);
            doc.setLineWidth(0.5);
            doc.line(10, 25, 200, 25);

            doc.setFontSize(24);
            doc.setTextColor(...gold);
            doc.setFont('times', 'bold');
            doc.text('CERTIFICAT DE VISITE', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(...darkText);
            doc.setFont('times', 'normal');
            doc.text('Bonifacio & Fils Immobilier', 105, 30, { align: 'center' });

            const date = new Date(visit.date);
            const dateStr = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            doc.setFontSize(9);
            doc.text(`Référence: ${visit.reference}`, 15, 35);
            doc.text(`Date: ${dateStr}`, 15, 40);
            doc.text(`Heure: ${timeStr}`, 15, 45);

            doc.setFontSize(11);
            doc.setFont('times', 'bold');
            doc.text('LIEU DE LA VISITE', 15, 55);

            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.text(visit.address, 15, 62, { maxWidth: 180 });

            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            doc.text('VISITEUR / CLIENT', 15, 80);

            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.text(`Nom: ${visit.visitorName}`, 15, 87);

            if (visit.location) {
                doc.setFont('times', 'bold');
                doc.setFontSize(11);
                doc.text('LOCALISATION', 15, 100);

                doc.setFont('times', 'normal');
                doc.setFontSize(9);
                doc.text(`GPS: ${visit.location.latitude.toFixed(6)}°, ${visit.location.longitude.toFixed(6)}°`, 15, 107);
                doc.text(`Précision: ±${Math.round(visit.location.accuracy)}m`, 15, 112);
            }

            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text('Données traitées conformément au RGPD - CNIL - Retention 24 mois', 105, 290, { align: 'center' });

            doc.setFontSize(7);
            doc.text('SIREN 904719879 | CPI 9401 2022 000 000 038 | RCP Verspieren', 105, 294, { align: 'center' });

            doc.save(`BonDeVisite_${visit.reference}.pdf`);
            this.showStatus('PDF téléchargé', 'success', 'status-history');

        } catch (error) {
            console.error('Error:', error);
            this.showStatus('Erreur lors du téléchargement', 'error', 'status-history');
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        if (screenId === 'historyScreen') {
            this.updateHistoryDisplay();
        }
    }

    showStatus(message, type = 'info', elementId = 'status') {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `status ${type} active`;

        setTimeout(() => {
            element.classList.remove('active');
        }, 4000);
    }
}

// Initialize app
const app = new VisitCertificateApp();
