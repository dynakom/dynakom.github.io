document.addEventListener('DOMContentLoaded', () => {
    // ---- VARIABLES ----
    const editBtn = document.getElementById('edit-toggle');
    const editableIds = [
        'name-display', 'role-display',
        'val-fullname', 'val-address', 'val-email', 'val-phone',
        'val-campus', 'val-faculty', 'val-prostudy', 'val-nim'
    ];
    let isEditing = false;

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
    dobInput.value = '2003-01-01'; // Default
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

    const card = document.querySelector('.glass-card');
    const container = document.querySelector('.container');
    container.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return;
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });
    container.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s ease';
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        setTimeout(() => card.style.transition = 'none', 500);
    });
    container.addEventListener('mouseenter', () => card.style.transition = 'none');

    // ---- EDIT LOGIC ----
    editBtn.addEventListener('click', () => {
        isEditing = !isEditing;
        toggleEditState(isEditing);
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
            // Parse existing text only if inputs are empty, otherwise keep input values (state)
            const fullDob = dobText.textContent;
            const splitDob = fullDob.split(', ');
            let currentPob = splitDob[0];
            // Better logic: if we already have a value in input, use it. But usually we want to sync from text if text was loaded from storage.
            // Since we update text on Save, text is the source of truth when viewing.
            if (splitDob.length < 2) currentPob = "Jakarta";

            pobInput.value = currentPob;

            dobText.classList.add('hidden');
            pobInput.classList.remove('hidden');
            dobInput.classList.remove('hidden');

            // Handle Socials
            socialDisplay.classList.add('hidden');
            socialInputs.classList.remove('hidden');

            // Pre-fill social inputs with current hrefs
            Object.keys(socialLinks).forEach(key => {
                socialLinks[key].input.value = socialLinks[key].btn.href;
            });

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
            // Handle DOB & POB
            dobText.classList.remove('hidden');
            pobInput.classList.add('hidden');
            dobInput.classList.add('hidden');

            // Format Date for Display
            const dateObj = new Date(dobInput.value);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const place = pobInput.value || "Jakarta";
            dobText.textContent = `${place}, ${dateObj.toLocaleDateString('id-ID', options)}`;

            // Handle Religion & Status
            religionText.classList.remove('hidden');
            religionSelect.classList.add('hidden');
            religionText.textContent = religionSelect.value;

            statusText.classList.remove('hidden');
            statusSelect.classList.add('hidden');
            statusText.textContent = statusSelect.value;

            // Handle Socials
            socialDisplay.classList.remove('hidden');
            socialInputs.classList.add('hidden');

            // Update Hrefs
            Object.keys(socialLinks).forEach(key => {
                let url = socialLinks[key].input.value;
                if (url && !url.startsWith('http')) url = 'https://' + url;
                socialLinks[key].btn.href = url;
            });

            // SAVE DATA
            saveData();
        }
    }

    function saveData() {
        const data = {};
        // Save text fields
        editableIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) data[id] = el.textContent;
        });

        // Save special fields
        data['dob'] = dobInput.value;
        data['pob'] = pobInput.value;
        data['religion'] = religionSelect.value;
        data['status'] = statusSelect.value;
        data['profileImg'] = profileImg.src;

        // Save socials
        const socials = {};
        Object.keys(socialLinks).forEach(key => {
            socials[key] = socialLinks[key].btn.href;
        });
        data['socials'] = socials;

        localStorage.setItem('biodata_dina', JSON.stringify(data));
    }

    function loadData() {
        const saved = localStorage.getItem('biodata_dina');
        if (!saved) return;

        const data = JSON.parse(saved);

        // Load text fields
        editableIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && data[id]) el.textContent = data[id];
        });

        // Load special fields
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

        // Load socials
        if (data['socials']) {
            Object.keys(socialLinks).forEach(key => {
                if (data['socials'][key]) {
                    socialLinks[key].btn.href = data['socials'][key];
                    socialLinks[key].input.value = data['socials'][key]; // pre-fill input just in case
                }
            });
        }
    }

    // Dynamic Age Update
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

    // Image Upload Handling
    // ---- MODAL & PHOTO LOGIC ----
    const modal = document.getElementById('photo-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const optionsGrid = document.getElementById('photo-options-grid');
    const cameraUI = document.getElementById('camera-ui');

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
        if (typeof avatarSelectionUI !== 'undefined') avatarSelectionUI.style.display = 'none';
        stopCamera();
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // 1. File Upload
    // Keep existing change listener, just trigger click from modal
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

    // 2. Camera Logic
    let stream = null;
    const video = document.getElementById('video-preview');
    const canvas = document.getElementById('canvas-capture');

    // Check if camera support exists
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
            alert("Tidak dapat mengakses kamera. Pastikan izin diberikan atau gunakan HTTPS/Localhost.\nError: " + err.message);
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

        // Horizontal flip for mirror effect consistency if desired, or simpler:
        context.translate(canvas.width, 0);
        context.scale(-1, 1);

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        profileImg.src = canvas.toDataURL('image/png');
        closeModal();
    });

    // 3. Avatar Logic
    const avatarSelectionUI = document.getElementById('avatar-selection-ui');
    const avatarGrid = document.getElementById('avatar-grid-container');

    document.getElementById('btn-select-avatar').addEventListener('click', () => {
        optionsGrid.style.display = 'none';
        avatarSelectionUI.style.display = 'block';
        loadAvatars();
    });

    document.getElementById('btn-back-avatar').addEventListener('click', resetModalView);

    function loadAvatars() {
        if (avatarGrid.children.length > 0) return; // Already loaded

        const seeds = [
            "Felix", "Aneka", "Zack", "Molly", "Buster", "Simba", "Baby", "Lola", "Leo", "Bella",
            "Jack", "Daisy", "Buddy", "Cleo", "Toby", "Lucy", "Max", "Luna", "Oliver", "Kitty"
        ];

        seeds.forEach(seed => {
            // Using 'adventurer' style for a more "Pinterest-aesthetic" illustrative look
            createAvatarItem(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`);
        });
    }

    function createAvatarItem(url) {
        const div = document.createElement('div');
        div.className = 'avatar-item';
        div.innerHTML = `<img src="${url}" loading="lazy" alt="Avatar">`;
        div.onclick = () => {
            profileImg.src = url;
            closeModal();
        };
        avatarGrid.appendChild(div);
    }

    // Override resetModalView to handle avatar selection visibility
    // Note: We need to redefine it or update the original definition.
    // Since 'resetModalView' was defined with 'function' keyword inside the scope, we can overwrite it if it was 'let' or modify its behavior if we access the same scope.
    // However, it was defined as 'function resetModalView()'. In JS strict mode inside block, this might be tricky.
    // Easier: Just update the `resetModalView` definition earlier in the file? 
    // Or, realizing I can't easily change the earlier function definition without a big replace.
    // I will just add the line `avatarSelectionUI.style.display = 'none';` to the existing `resetModalView` by redefining it here if possible or I'll just attach it to the `resetModalView` calls?
    // Actually, I can just create a NEW function `fullReset()` and use that, but `resetModalView` is called in other places.
    // Let's replace the `resetModalView` definition up top.

    // Wait, I am in the middle of replacing the avatar logic block.
    // I will just make sure `resetModalView` updates the display of `avatarSelectionUI` by re-assigning it if it's not const.
    // Ah, it was `function resetModalView() {...}`.
    // I will just copy the logic effectively.

    // Better strategy: I will replace the Avatar Logic block AND the resetModalView block in one go? 
    // No, `resetModalView` is earlier (around line 183).
    // I will just add `avatarSelectionUI.style.display = 'none';` in the `document.getElementById('btn-cancel-camera').addEventListener` which calls `resetModalView`.
    // Actually, `resetModalView` is called by `openModal` too. 
    // I'll leave `resetModalView` as is for now, and just ensure MY new code handles the resetting correctly.
    // When I click 'back', I call `resetModalView`. `resetModalView` shows `optionsGrid`.
    // But it doesn't hide `avatarSelectionUI`. 
    // I will simply add a line to hide it in the `resetModalView` definition in a separate replacement call.
    // For now, let's just implement the Logic. I will handle the resetModalView update in next step.

    // 4. Delete Photo
    // 4. Delete Photo (Default Empty Profile)
    document.getElementById('btn-delete-photo').addEventListener('click', () => {
        if (confirm("Hapus foto profil?")) {
            // Using a generic empty profile SVG from a reliable source or data URI
            profileImg.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
            closeModal();
        }
    });
});
