// Client Information Gathering System
// Collects comprehensive client data without external dependencies

class ClientInfoGatherer {
    constructor() {
        this.data = {};
        this.init();
    }

    async init() {
        // Gather all information
        this.gatherBrowserInfo();
        this.gatherSystemInfo();
        this.gatherDeviceInfo();
        this.gatherConnectionInfo();
        this.gatherFeatureSupport();
        
        // Get network info (public IP) - this requires external service
        await this.gatherNetworkInfo();
        
        // Display all information
        this.displayInfo();
    }

    gatherBrowserInfo() {
        const nav = navigator;
        const ua = nav.userAgent;
        
        this.data.browser = {
            userAgent: ua,
            vendor: nav.vendor || 'Unknown',
            product: nav.product || 'Unknown',
            appName: nav.appName || 'Unknown',
            appVersion: nav.appVersion || 'Unknown',
            appCodeName: nav.appCodeName || 'Unknown',
            platform: nav.platform || 'Unknown',
            language: nav.language || 'Unknown',
            languages: nav.languages ? Array.from(nav.languages) : ['Unknown'],
            cookieEnabled: nav.cookieEnabled,
            onLine: nav.onLine,
            doNotTrack: nav.doNotTrack || 'Not specified',
            
            // Parse browser details from user agent
            browserName: this.getBrowserName(ua),
            browserVersion: this.getBrowserVersion(ua),
            engineName: this.getEngineName(ua),
            engineVersion: this.getEngineVersion(ua)
        };
    }

    gatherSystemInfo() {
        const nav = navigator;
        const ua = nav.userAgent;
        
        this.data.system = {
            platform: nav.platform || 'Unknown',
            operatingSystem: this.getOperatingSystem(ua),
            osVersion: this.getOSVersion(ua),
            architecture: this.getArchitecture(ua),
            cpuCores: nav.hardwareConcurrency || 'Unknown',
            maxTouchPoints: nav.maxTouchPoints || 0,
            pdfViewerEnabled: nav.pdfViewerEnabled || false
        };
    }

    gatherDeviceInfo() {
        this.data.device = {
            screenWidth: screen.width,
            screenHeight: screen.height,
            screenAvailWidth: screen.availWidth,
            screenAvailHeight: screen.availHeight,
            screenColorDepth: screen.colorDepth,
            screenPixelDepth: screen.pixelDepth,
            screenOrientation: screen.orientation ? {
                angle: screen.orientation.angle,
                type: screen.orientation.type
            } : 'Not available',
            
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            
            // Touch and input capabilities
            touchSupport: 'ontouchstart' in window,
            pointerSupport: 'onpointerdown' in window,
            
            // Battery API (if available)
            batterySupport: 'getBattery' in navigator
        };

        // Get battery info if available
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                this.data.device.battery = {
                    charging: battery.charging,
                    level: Math.round(battery.level * 100) + '%',
                    chargingTime: battery.chargingTime === Infinity ? 'Unknown' : battery.chargingTime + ' seconds',
                    dischargingTime: battery.dischargingTime === Infinity ? 'Unknown' : battery.dischargingTime + ' seconds'
                };
                this.displayInfo(); // Refresh display with battery info
            });
        }
    }

    gatherConnectionInfo() {
        this.data.connection = {
            connectionType: this.getConnectionType(),
            effectiveType: navigator.connection?.effectiveType || 'Unknown',
            downlink: navigator.connection?.downlink || 'Unknown',
            rtt: navigator.connection?.rtt || 'Unknown',
            saveData: navigator.connection?.saveData || false,
            
            // WebRTC info
            webRTCSupport: 'RTCPeerConnection' in window,
            
            // Protocol info
            protocol: location.protocol,
            hostname: location.hostname,
            port: location.port || (location.protocol === 'https:' ? '443' : '80'),
            
            // Timezone
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset()
        };
    }

    gatherFeatureSupport() {
        this.data.features = {
            // Storage
            localStorage: 'localStorage' in window,
            sessionStorage: 'sessionStorage' in window,
            indexedDB: 'indexedDB' in window,
            
            // APIs
            geolocation: 'geolocation' in navigator,
            webGL: this.checkWebGLSupport(),
            webAssembly: 'WebAssembly' in window,
            serviceWorker: 'serviceWorker' in navigator,
            pushManager: 'PushManager' in window,
            notification: 'Notification' in window,
            
            // Audio/Video
            webRTC: 'RTCPeerConnection' in window,
            mediaDevices: 'mediaDevices' in navigator,
            getUserMedia: 'getUserMedia' in navigator,
            
            // Graphics
            canvas: 'getContext' in document.createElement('canvas'),
            webGL2: this.checkWebGL2Support(),
            
            // Input
            gamepad: 'getGamepads' in navigator,
            vibrate: 'vibrate' in navigator,
            
            // Security
            crypto: 'crypto' in window,
            secureContext: window.isSecureContext,
            
            // Performance
            performanceObserver: 'PerformanceObserver' in window,
            performanceTiming: 'performance' in window,
            
            // Modern JS features
            modules: 'noModule' in document.createElement('script'),
            intersectionObserver: 'IntersectionObserver' in window,
            resizeObserver: 'ResizeObserver' in window,
            
            // CSS features
            cssSupportsAPI: 'supports' in CSS,
            cssVariables: CSS.supports('color', 'var(--test)')
        };
    }

    async gatherNetworkInfo() {
        try {
            // Try multiple IP services for redundancy
            const ipServices = [
                'https://api.ipify.org?format=json',
                'https://httpbin.org/ip',
                'https://api.myip.com',
                'https://ipapi.co/json/'
            ];

            for (const service of ipServices) {
                try {
                    const response = await fetch(service);
                    const data = await response.json();
                    
                    this.data.network = {
                        publicIP: data.ip || data.origin || data.query || 'Unable to determine',
                        ipService: service,
                        headers: {}
                    };

                    // If we have additional data from the service
                    if (data.country) this.data.network.country = data.country;
                    if (data.city) this.data.network.city = data.city;
                    if (data.region) this.data.network.region = data.region;
                    if (data.org) this.data.network.organization = data.org;
                    if (data.as) this.data.network.autonomous_system = data.as;

                    break; // Exit loop on successful fetch
                } catch (e) {
                    continue; // Try next service
                }
            }

            // If all services failed
            if (!this.data.network) {
                this.data.network = {
                    publicIP: 'Unable to determine (CORS/Network restrictions)',
                    error: 'All IP services failed'
                };
            }
        } catch (error) {
            this.data.network = {
                publicIP: 'Error retrieving IP',
                error: error.message
            };
        }
    }

    // Helper methods for parsing user agent
    getBrowserName(ua) {
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome') && !ua.includes('Chromium')) return 'Chrome';
        if (ua.includes('Chromium')) return 'Chromium';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
        if (ua.includes('Trident')) return 'Internet Explorer';
        return 'Unknown';
    }

    getBrowserVersion(ua) {
        const browserName = this.getBrowserName(ua);
        let match;
        
        switch (browserName) {
            case 'Chrome':
                match = ua.match(/Chrome\/(\d+\.\d+)/);
                break;
            case 'Firefox':
                match = ua.match(/Firefox\/(\d+\.\d+)/);
                break;
            case 'Safari':
                match = ua.match(/Version\/(\d+\.\d+)/);
                break;
            case 'Edge':
                match = ua.match(/Edge\/(\d+\.\d+)/);
                break;
            case 'Opera':
                match = ua.match(/(?:Opera|OPR)\/(\d+\.\d+)/);
                break;
            default:
                return 'Unknown';
        }
        
        return match ? match[1] : 'Unknown';
    }

    getEngineName(ua) {
        if (ua.includes('Blink')) return 'Blink';
        if (ua.includes('WebKit')) return 'WebKit';
        if (ua.includes('Gecko')) return 'Gecko';
        if (ua.includes('Trident')) return 'Trident';
        if (ua.includes('EdgeHTML')) return 'EdgeHTML';
        return 'Unknown';
    }

    getEngineVersion(ua) {
        let match = ua.match(/WebKit\/(\d+\.\d+)/);
        if (match) return match[1];
        
        match = ua.match(/Gecko\/(\d+)/);
        if (match) return match[1];
        
        return 'Unknown';
    }

    getOperatingSystem(ua) {
        if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
        if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
        if (ua.includes('Windows NT 6.2')) return 'Windows 8';
        if (ua.includes('Windows NT 6.1')) return 'Windows 7';
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac OS X')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        if (ua.includes('iPad')) return 'iPadOS';
        return 'Unknown';
    }

    getOSVersion(ua) {
        let match;
        
        // Windows
        match = ua.match(/Windows NT (\d+\.\d+)/);
        if (match) return match[1];
        
        // macOS
        match = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
        if (match) return match[1].replace(/_/g, '.');
        
        // Android
        match = ua.match(/Android (\d+\.\d+)/);
        if (match) return match[1];
        
        // iOS
        match = ua.match(/OS (\d+_\d+)/);
        if (match) return match[1].replace(/_/g, '.');
        
        return 'Unknown';
    }

    getArchitecture(ua) {
        if (ua.includes('WOW64') || ua.includes('Win64') || ua.includes('x86_64')) return '64-bit';
        if (ua.includes('ARM')) return 'ARM';
        if (ua.includes('x86')) return '32-bit';
        return 'Unknown';
    }

    getConnectionType() {
        if (navigator.connection) {
            return navigator.connection.effectiveType || navigator.connection.type || 'Unknown';
        }
        return 'Not available';
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    checkWebGL2Support() {
        try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl2');
        } catch (e) {
            return false;
        }
    }

    displayInfo() {
        this.displayNetworkInfo();
        this.displayBrowserInfo();
        this.displaySystemInfo();
        this.displayDeviceInfo();
        this.displayConnectionInfo();
        this.displayFeatureInfo();
        this.displayRawData();
    }

    displayNetworkInfo() {
        const container = document.getElementById('networkInfo');
        if (!this.data.network) {
            container.innerHTML = '<div class="loading">Loading...</div>';
            return;
        }

        container.innerHTML = this.createInfoItems([
            ['Public IP Address', this.data.network.publicIP],
            ['Country', this.data.network.country || 'Not available'],
            ['City', this.data.network.city || 'Not available'],
            ['Region', this.data.network.region || 'Not available'],
            ['Organization', this.data.network.organization || 'Not available'],
            ['Autonomous System', this.data.network.autonomous_system || 'Not available'],
            ['IP Service Used', this.data.network.ipService || 'Not available']
        ]);
    }

    displayBrowserInfo() {
        const container = document.getElementById('browserInfo');
        container.innerHTML = this.createInfoItems([
            ['Browser Name', this.data.browser.browserName],
            ['Browser Version', this.data.browser.browserVersion],
            ['Engine Name', this.data.browser.engineName],
            ['Engine Version', this.data.browser.engineVersion],
            ['User Agent', this.data.browser.userAgent],
            ['Vendor', this.data.browser.vendor],
            ['App Name', this.data.browser.appName],
            ['App Version', this.data.browser.appVersion],
            ['Language', this.data.browser.language],
            ['Languages', this.data.browser.languages.join(', ')],
            ['Cookies Enabled', this.data.browser.cookieEnabled ? 'Yes' : 'No'],
            ['Online Status', this.data.browser.onLine ? 'Online' : 'Offline'],
            ['Do Not Track', this.data.browser.doNotTrack]
        ]);
    }

    displaySystemInfo() {
        const container = document.getElementById('systemInfo');
        container.innerHTML = this.createInfoItems([
            ['Operating System', this.data.system.operatingSystem],
            ['OS Version', this.data.system.osVersion],
            ['Platform', this.data.system.platform],
            ['Architecture', this.data.system.architecture],
            ['CPU Cores', this.data.system.cpuCores],
            ['Max Touch Points', this.data.system.maxTouchPoints],
            ['PDF Viewer Enabled', this.data.system.pdfViewerEnabled ? 'Yes' : 'No']
        ]);
    }

    displayDeviceInfo() {
        const container = document.getElementById('deviceInfo');
        const batteryInfo = this.data.device.battery ? [
            ['Battery Charging', this.data.device.battery.charging ? 'Yes' : 'No'],
            ['Battery Level', this.data.device.battery.level],
            ['Charging Time', this.data.device.battery.chargingTime],
            ['Discharging Time', this.data.device.battery.dischargingTime]
        ] : [];

        container.innerHTML = this.createInfoItems([
            ['Screen Resolution', `${this.data.device.screenWidth} × ${this.data.device.screenHeight}`],
            ['Available Screen', `${this.data.device.screenAvailWidth} × ${this.data.device.screenAvailHeight}`],
            ['Viewport Size', `${this.data.device.viewportWidth} × ${this.data.device.viewportHeight}`],
            ['Color Depth', `${this.data.device.screenColorDepth} bits`],
            ['Pixel Depth', `${this.data.device.screenPixelDepth} bits`],
            ['Device Pixel Ratio', this.data.device.devicePixelRatio],
            ['Screen Orientation', typeof this.data.device.screenOrientation === 'object' ? 
                `${this.data.device.screenOrientation.type} (${this.data.device.screenOrientation.angle}°)` : 
                this.data.device.screenOrientation],
            ['Touch Support', this.data.device.touchSupport ? 'Yes' : 'No'],
            ['Pointer Support', this.data.device.pointerSupport ? 'Yes' : 'No'],
            ['Battery API Support', this.data.device.batterySupport ? 'Yes' : 'No'],
            ...batteryInfo
        ]);
    }

    displayConnectionInfo() {
        const container = document.getElementById('connectionInfo');
        container.innerHTML = this.createInfoItems([
            ['Connection Type', this.data.connection.connectionType],
            ['Effective Type', this.data.connection.effectiveType],
            ['Downlink Speed', this.data.connection.downlink + ' Mbps'],
            ['Round Trip Time', this.data.connection.rtt + ' ms'],
            ['Save Data Mode', this.data.connection.saveData ? 'Enabled' : 'Disabled'],
            ['Protocol', this.data.connection.protocol],
            ['Hostname', this.data.connection.hostname],
            ['Port', this.data.connection.port],
            ['Timezone', this.data.connection.timezone],
            ['Timezone Offset', this.data.connection.timezoneOffset + ' minutes'],
            ['WebRTC Support', this.data.connection.webRTCSupport ? 'Yes' : 'No']
        ]);
    }

    displayFeatureInfo() {
        const container = document.getElementById('featureInfo');
        const features = this.data.features;
        
        container.innerHTML = this.createInfoItems([
            ['Local Storage', features.localStorage ? 'Supported' : 'Not supported'],
            ['Session Storage', features.sessionStorage ? 'Supported' : 'Not supported'],
            ['IndexedDB', features.indexedDB ? 'Supported' : 'Not supported'],
            ['Geolocation API', features.geolocation ? 'Supported' : 'Not supported'],
            ['WebGL', features.webGL ? 'Supported' : 'Not supported'],
            ['WebGL 2', features.webGL2 ? 'Supported' : 'Not supported'],
            ['WebAssembly', features.webAssembly ? 'Supported' : 'Not supported'],
            ['Service Worker', features.serviceWorker ? 'Supported' : 'Not supported'],
            ['Push Manager', features.pushManager ? 'Supported' : 'Not supported'],
            ['Notifications', features.notification ? 'Supported' : 'Not supported'],
            ['WebRTC', features.webRTC ? 'Supported' : 'Not supported'],
            ['Media Devices', features.mediaDevices ? 'Supported' : 'Not supported'],
            ['Canvas', features.canvas ? 'Supported' : 'Not supported'],
            ['Gamepad API', features.gamepad ? 'Supported' : 'Not supported'],
            ['Vibration API', features.vibrate ? 'Supported' : 'Not supported'],
            ['Crypto API', features.crypto ? 'Supported' : 'Not supported'],
            ['Secure Context', features.secureContext ? 'Yes' : 'No'],
            ['Performance Observer', features.performanceObserver ? 'Supported' : 'Not supported'],
            ['ES6 Modules', features.modules ? 'Supported' : 'Not supported'],
            ['Intersection Observer', features.intersectionObserver ? 'Supported' : 'Not supported'],
            ['Resize Observer', features.resizeObserver ? 'Supported' : 'Not supported'],
            ['CSS Supports API', features.cssSupportsAPI ? 'Supported' : 'Not supported'],
            ['CSS Variables', features.cssVariables ? 'Supported' : 'Not supported']
        ]);
    }

    displayRawData() {
        const container = document.getElementById('rawData');
        container.textContent = JSON.stringify(this.data, null, 2);
    }

    createInfoItems(items) {
        return items.map(([label, value]) => 
            `<div class="info-item">
                <span class="info-label">${label}:</span>
                <span class="info-value">${value || 'Not available'}</span>
            </div>`
        ).join('');
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ClientInfoGatherer();
});

// Export for potential use in other scripts
window.ClientInfoGatherer = ClientInfoGatherer;