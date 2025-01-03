// Global variables
let classifier;
let isModelLoaded = false;

// DOM Elements
const modelStatus = document.getElementById('model-status');
const imageInput = document.getElementById('image-input');
const previewSection = document.querySelector('.preview-section');
const previewImage = document.getElementById('preview-image');
const loadingSpinner = document.getElementById('loading-spinner');
const predictions = document.getElementById('predictions');
const resetButton = document.getElementById('reset-button');

// Initialize MobileNet classifier
async function initializeModel() {
    try {
        classifier = await ml5.imageClassifier('https://teachablemachine.withgoogle.com/models/f9BKtcaOX/', () => {
            isModelLoaded = true;
            modelStatus.textContent =
              "The AI model is ready! You can now upload an image to see the results.";
            modelStatus.style.backgroundColor = '#d4edda';
            modelStatus.style.color = '#155724';
        });
    } catch (error) {
        modelStatus.textContent = 'Error loading model. Please refresh the page.';
        modelStatus.style.backgroundColor = '#f8d7da';
        modelStatus.style.color = '#721c24';
        console.error('Error loading model:', error);
    }
}

// Handle file selection
imageInput.addEventListener('change', handleImageUpload);

// Handle drag and drop
const uploadButton = document.querySelector('.upload-button');
uploadButton.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadButton.style.backgroundColor = '#e3e3e3';
});

uploadButton.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadButton.style.backgroundColor = '#f8f9fa';
});

uploadButton.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadButton.style.backgroundColor = '#f8f9fa';
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageUpload({ target: { files: e.dataTransfer.files } });
    }
});

// Handle image upload
async function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
        alert('Please upload an image file');
        return;
    }

    // Show preview section
    previewSection.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    predictions.innerHTML = '';

    // Create and display image preview
    const reader = new FileReader();
    reader.onload = async function(e) {
        previewImage.src = e.target.result;
        previewImage.onload = async function() {
            if (isModelLoaded) {
                await classifyImage();
            } else {
                alert('Please wait for the model to load');
            }
        };
    };
    reader.readAsDataURL(file);
}

// Classify the image
async function classifyImage() {
    try {
        const results = await classifier.classify(previewImage);
        displayResults(results);
    } catch (error) {
        console.error('Error classifying image:', error);
        predictions.innerHTML = '<p class="error">Error classifying image. Please try again.</p>';
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Display classification results
function displayResults(results) {
  predictions.innerHTML = "";

  results.slice(0, 5).forEach((result, index) => {
    const confidence = (result.confidence * 100).toFixed(2);
    const predictionEl = document.createElement("div");
    predictionEl.className = "prediction-item mb-4";
    predictionEl.innerHTML = `
      <div class="flex items-center mb-2">
        <div class="label text-lg font-bold mr-4">${result.label}</div>
        <div class="confidence flex items-center w-full">
          <div class="confidence-bar bg-yellow-400 h-2 rounded-full" style="width: ${confidence}%"></div>
          <span class="ml-4 text-sm text-gray-300">${confidence}%</span>
        </div>
      </div>
    `;
    predictions.appendChild(predictionEl);
  });
}



// Reset the form
resetButton.addEventListener('click', () => {
    imageInput.value = '';
    previewSection.classList.add('hidden');
    predictions.innerHTML = '';
});

// Initialize the model when the page loads
initializeModel();