document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Video Upload Preview
    const videoInput = document.getElementById('video-upload');
    const videoPreview = document.getElementById('video-preview');
    const uploadLabel = document.querySelector('.file-upload label span');

    videoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            videoPreview.src = url;
            videoPreview.style.display = 'block';
            uploadLabel.textContent = file.name;
        }
    });

    // Drag and Drop
    const dropZone = document.querySelector('.file-upload');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('highlight');
    }

    function unhighlight(e) {
        dropZone.classList.remove('highlight');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];

        if (file && file.type.startsWith('video/')) {
            videoInput.files = dt.files;
            const url = URL.createObjectURL(file);
            videoPreview.src = url;
            videoPreview.style.display = 'block';
            uploadLabel.textContent = file.name;
        }
    }

    // Load Content Library
    loadContentLibrary();
});

function loadContentLibrary() {
    const contentGrid = document.querySelector('.content-grid');
    const sampleContent = [
        {
            type: 'video',
            title: 'Full Body HIIT',
            thumbnail: '/Assets/hiit.jpg',
            date: '2024-03-14',
            views: 1234
        },
        {
            type: 'blog',
            title: 'Nutrition Guidelines',
            thumbnail: '/Assets/nutrition.jpg',
            date: '2024-03-13',
            reads: 567
        }
        // Add more sample content
    ];

    contentGrid.innerHTML = sampleContent.map(content => `
        <div class="content-card">
            <div class="content-thumbnail">
                <img src="${content.thumbnail}" alt="${content.title}">
            </div>
            <div class="content-info">
                <h3 class="content-title">${content.title}</h3>
                <div class="content-meta">
                    <span>${content.type}</span> • 
                    <span>${content.date}</span> • 
                    <span>${content.type === 'video' ? content.views + ' views' : content.reads + ' reads'}</span>
                </div>
            </div>
        </div>
    `).join('');
}
document.getElementById('blog-image').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'No file selected';
    this.parentElement.querySelector('.file-name-display').textContent = fileName;
});