/* settings.js - App settings management with toggle UI */

const Settings = {

    DEFAULTS: {
        spacedRepetition: true,
        encouragingMessages: true,
        showAvatar: true,
        dailyChallengeReminder: true,
    },

    _key: 'mentalMaths_settings',

    getAll() {
        try {
            const raw = localStorage.getItem(this._key);
            return raw ? { ...this.DEFAULTS, ...JSON.parse(raw) } : { ...this.DEFAULTS };
        } catch {
            return { ...this.DEFAULTS };
        }
    },

    get(key, defaultVal) {
        const all = this.getAll();
        return key in all ? all[key] : (defaultVal !== undefined ? defaultVal : this.DEFAULTS[key]);
    },

    set(key, value) {
        const all = this.getAll();
        all[key] = value;
        localStorage.setItem(this._key, JSON.stringify(all));
    },

    // Teacher PIN management
    getTeacherPIN() {
        return localStorage.getItem('mentalMaths_teacherPIN') || null;
    },

    setTeacherPIN(pin) {
        localStorage.setItem('mentalMaths_teacherPIN', pin);
    },

    hasTeacherPIN() {
        return !!this.getTeacherPIN();
    },

    verifyPIN(input) {
        const stored = this.getTeacherPIN();
        if (!stored) return true; // No PIN set = open access
        return input === stored;
    },

    // Render settings screen content
    renderSettings() {
        const settings = this.getAll();
        const settingsList = [
            { key: 'spacedRepetition', label: 'Spaced Repetition', desc: 'Use SM-2 algorithm to schedule strategy reviews based on your performance' },
            { key: 'encouragingMessages', label: 'Encouraging Messages', desc: 'Show motivational messages during practice' },
            { key: 'showAvatar', label: 'Show Avatar', desc: 'Display a character that reacts to your performance' },
            { key: 'dailyChallengeReminder', label: 'Daily Challenge', desc: 'Show daily challenge on home screen' },
        ];

        let html = '<div class="settings-list">';
        settingsList.forEach(s => {
            html += `
            <div class="settings-row">
                <div class="settings-info">
                    <div class="settings-label">${s.label}</div>
                    <div class="settings-desc">${s.desc}</div>
                </div>
                <label class="toggle">
                    <input type="checkbox" data-setting="${s.key}" ${settings[s.key] ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>`;
        });
        html += '</div>';

        // Teacher PIN section
        html += `
        <div class="settings-section">
            <h3>Teacher Dashboard</h3>
            <div class="settings-row">
                <div class="settings-info">
                    <div class="settings-label">Dashboard PIN</div>
                    <div class="settings-desc">${this.hasTeacherPIN() ? 'PIN is set. Tap to change.' : 'Set a PIN to protect the teacher dashboard.'}</div>
                </div>
                <button class="btn btn-small" id="btn-set-pin">${this.hasTeacherPIN() ? 'Change' : 'Set PIN'}</button>
            </div>
        </div>`;

        return html;
    },

    bindSettingsEvents(container) {
        container.querySelectorAll('[data-setting]').forEach(input => {
            input.addEventListener('change', () => {
                this.set(input.dataset.setting, input.checked);
            });
        });

        const pinBtn = container.querySelector('#btn-set-pin');
        if (pinBtn) {
            pinBtn.addEventListener('click', () => {
                const pin = prompt('Enter a 4-digit PIN for the teacher dashboard:');
                if (pin && /^\d{4}$/.test(pin)) {
                    this.setTeacherPIN(pin);
                    alert('PIN saved!');
                    pinBtn.previousElementSibling.querySelector('.settings-desc').textContent = 'PIN is set. Tap to change.';
                    pinBtn.textContent = 'Change';
                } else if (pin !== null) {
                    alert('Please enter exactly 4 digits.');
                }
            });
        }
    },
};
