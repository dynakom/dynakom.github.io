document.addEventListener('DOMContentLoaded', () => {
    // ---- VARIABLES ----
    const editBtn = document.getElementById('edit-toggle');
    const editableIds = [
        'name-display', 'role-display',
        'val-fullname', 'val-address', 'val-email', 'val-phone',
        'val-campus', 'val-faculty', 'val-prostudy', 'val-nim'
    ];
    let isEditing = false;
    let isOwner = false;
    const ADMIN_PASSWORD = "123"; // Ganti sesuai keinginan

    // Special Fields elements
    const dobText = document.getElementById('val-dob-text');
    const pobInput = document.getElementById('val-pob-input');
    const dobInput = document.getElementById('val-dob-input');
    const religionText = document.getElementById('val-religion-text');
    const religionSelect = document.getElementById('val-religion-select');
    const statusText = document.getElementById('val-status-text');
    const statusSelect = document.getElementById('val-status-select');
    const ageDisplay = document.getElementById('age-display');

    // Image Upload
    const profileImg = document.getElementById('profile-img');
    const imgUpload = document.getElementById('img-upload');

    // Initialize Profile Click
    profileImg.style.cursor = "pointer";
    profileImg.onclick = () => openModal();

    // Social Links
    const socialDisplay = document.getElementById('social-display');
    const socialInputs = document.getElementById('social-inputs');
    const socialLinks = {
        instagram: { btn: document.getElementById('link-instagram'), input: document.getElementById('in-instagram') },
        facebook: { btn: document.getElementById('link-facebook'), input: document.getElementById('in-facebook') },
        github: { btn: document.getElementById('link-github'), input: document.getElementById('in-github') }
    };

    // Initialize DOB input value from text (Approximate for initial load)
    dobInput.value = '2006-04-30'; // Updated to match HTML
    calculateAge(new Date(dobInput.value));

    // Load Data from LocalStorage (Overrides default if data exists)
    loadData();

    // ---- ANIMATIONS ----
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) translateX(0)';
        }, 300 + (index * 100));
    });

    // ---- EDIT LOGIC ----
    editBtn.addEventListener('click', () => {
        if (!isEditing) {
            const pw = prompt("Masukkan Password untuk Edit (Kosongkan jika hanya ingin mencoba fitur):");
            if (pw === ADMIN_PASSWORD) {
                isOwner = true;
                showToast("Mode Admin Aktif - Perubahan akan disimpan.", "success");
            } else {
                isOwner = false;
                showToast("Mode Simulasi - Perubahan TIDAK akan disimpan secara permanen.", "warning");
            }
            isEditing = true;
            toggleEditState(true);
        } else {
            isEditing = false;
            toggleEditState(false);
        }
    });

    function toggleEditState(editing) {
        if (editing) {
            // Switch to Edit Mode
            editBtn.innerHTML = '<i class="fas fa-save"></i>';
            editBtn.classList.add('saving');

            // Text to ContentEditable
            editableIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.contentEditable = "true";
                    el.classList.add('editable-highlight');
                }
            });

            // Handle Special Fields (Show Inputs)
            dobText.classList.add('hidden');
            dobInput.classList.remove('hidden');

            religionText.classList.add('hidden');
            religionSelect.classList.remove('hidden');
            religionSelect.value = religionText.textContent;

            statusText.classList.add('hidden');
            statusSelect.classList.remove('hidden');
            statusSelect.value = statusText.textContent;

            // Handle DOB & POB
            const fullDob = dobText.textContent;
            const splitDob = fullDob.split(', ');
            let currentPob = splitDob[0];
            if (splitDob.length < 2) currentPob = "Jakarta";

            pobInput.value = currentPob;

            dobText.classList.add('hidden');
            pobInput.classList.remove('hidden');
            dobInput.classList.remove('hidden');

            // Handle Socials
            socialDisplay.classList.add('hidden');
            socialInputs.classList.remove('hidden');

            Object.keys(socialLinks).forEach(key => {
                socialLinks[key].input.value = socialLinks[key].btn.href;
            });

            // Add Demo Badge if not owner
            if (!isOwner) {
                const nameDisplay = document.getElementById('name-display');
                if (!document.querySelector('.demo-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'demo-badge';
                    badge.textContent = 'Simulasi';
                    nameDisplay.appendChild(badge);
                }
            }

        } else {
            // Save and Switch to View Mode
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.classList.remove('saving');

            // ContentEditable to Text
            editableIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.contentEditable = "false";
                    el.classList.remove('editable-highlight');
                }
            });

            // Handle Special Fields (Show Text)
            dobText.classList.remove('hidden');
            pobInput.classList.add('hidden');
            dobInput.classList.add('hidden');

            const dateObj = new Date(dobInput.value);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const place = pobInput.value || "Jakarta";
            dobText.textContent = `${place}, ${dateObj.toLocaleDateString('id-ID', options)}`;

            religionText.classList.remove('hidden');
            religionSelect.classList.add('hidden');
            religionText.textContent = religionSelect.value;

            statusText.classList.remove('hidden');
            statusSelect.classList.add('hidden');
            statusText.textContent = statusSelect.value;

            socialDisplay.classList.remove('hidden');
            socialInputs.classList.add('hidden');

            Object.keys(socialLinks).forEach(key => {
                let url = socialLinks[key].input.value;
                if (url && !url.startsWith('http')) url = 'https://' + url;
                socialLinks[key].btn.href = url;
            });

            // SAVE DATA
            if (isOwner) {
                saveData();
                showToast("Data berhasil disimpan secara permanen!", "success");
            } else {
                showToast("Perubahan simulasi selesai (Data asli tetap terjaga)", "info");
                const badge = document.querySelector('.demo-badge');
                if (badge) badge.remove();
            }
        }
    }

    function saveData() {
        const data = {};
        editableIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) data[id] = el.textContent;
        });

        data['dob'] = dobInput.value;
        data['pob'] = pobInput.value;
        data['religion'] = religionSelect.value;
        data['status'] = statusSelect.value;
        data['profileImg'] = profileImg.src;

        const socials = {};
        Object.keys(socialLinks).forEach(key => {
            socials[key] = socialLinks[key].btn.href;
        });
        data['socials'] = socials;

        localStorage.setItem('biodata_dina_v2', JSON.stringify(data));
    }

    function loadData() {
        const saved = localStorage.getItem('biodata_dina_v2');
        if (!saved) return;

        const data = JSON.parse(saved);

        editableIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && data[id]) el.textContent = data[id];
        });

        if (data['dob'] || data['pob']) {
            if (data['dob']) dobInput.value = data['dob'];
            if (data['pob']) pobInput.value = data['pob'];

            const dateObj = new Date(dobInput.value);
            calculateAge(dateObj);

            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const place = pobInput.value || "Jakarta";
            dobText.textContent = `${place}, ${dateObj.toLocaleDateString('id-ID', options)}`;
        }

        if (data['religion']) {
            religionSelect.value = data['religion'];
            religionText.textContent = data['religion'];
        }

        if (data['status']) {
            statusSelect.value = data['status'];
            statusText.textContent = data['status'];
        }

        if (data['profileImg']) {
            profileImg.src = data['profileImg'];
        }

        if (data['socials']) {
            Object.keys(socialLinks).forEach(key => {
                if (data['socials'][key]) {
                    socialLinks[key].btn.href = data['socials'][key];
                    socialLinks[key].input.value = data['socials'][key];
                }
            });
        }
    }

    dobInput.addEventListener('change', () => {
        calculateAge(new Date(dobInput.value));
    });

    function calculateAge(birthDate) {
        if (isNaN(birthDate.getTime())) return;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        ageDisplay.textContent = `${age} Tahun`;
    }

    // ---- MODAL & PHOTO LOGIC ----
    const modal = document.getElementById('photo-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const optionsGrid = document.getElementById('photo-options-grid');
    const cameraUI = document.getElementById('camera-ui');
    const avatarSelectionUI = document.getElementById('avatar-selection-ui');
    const avatarGrid = document.getElementById('avatar-grid-container');

    function openModal() {
        modal.classList.add('active');
        resetModalView();
    }

    function closeModal() {
        modal.classList.remove('active');
        stopCamera();
    }

    function resetModalView() {
        optionsGrid.style.display = 'grid';
        cameraUI.classList.remove('active');
        if (avatarSelectionUI) avatarSelectionUI.style.display = 'none';
        stopCamera();
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.getElementById('btn-upload').addEventListener('click', () => {
        imgUpload.click();
        closeModal();
    });

    imgUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImg.src = e.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    let stream = null;
    const video = document.getElementById('video-preview');
    const canvas = document.getElementById('canvas-capture');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        document.getElementById('btn-camera').style.display = 'none';
    }

    document.getElementById('btn-camera').addEventListener('click', startCamera);
    document.getElementById('btn-cancel-camera').addEventListener('click', resetModalView);

    async function startCamera() {
        optionsGrid.style.display = 'none';
        cameraUI.classList.add('active');
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
        } catch (err) {
            alert("Tidak dapat mengakses kamera.");
            resetModalView();
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    document.getElementById('btn-capture').addEventListener('click', () => {
        if (!stream) return;
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        profileImg.src = canvas.toDataURL('image/png');
        closeModal();
    });

    document.getElementById('btn-select-avatar').addEventListener('click', () => {
        optionsGrid.style.display = 'none';
        avatarSelectionUI.style.display = 'block';
        loadAvatars();
    });

    document.getElementById('btn-back-avatar').addEventListener('click', resetModalView);

    function loadAvatars() {
        if (avatarGrid.children.length > 0) return;
        const seeds = ["Felix", "Aneka", "Zack", "Molly", "Buster", "Simba", "Baby", "Lola", "Leo", "Bella"];
        seeds.forEach(seed => {
            const div = document.createElement('div');
            div.className = 'avatar-item';
            div.innerHTML = `<img src="https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9" alt="Avatar">`;
            div.onclick = () => {
                profileImg.src = div.querySelector('img').src;
                closeModal();
            };
            avatarGrid.appendChild(div);
        });
    }

    document.getElementById('btn-delete-photo').addEventListener('click', () => {
        if (confirm("Hapus foto profil?")) {
            profileImg.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
            closeModal();
        }
    });

    // ---- TOAST NOTIFICATION ----
    function showToast(message, type = "info") {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: 'check-circle', warning: 'exclamation-triangle', info: 'info-circle' };
        toast.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
});
