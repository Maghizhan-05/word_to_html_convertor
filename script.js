// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    // Get references to the DOM elements
    const fileUpload = document.getElementById('file-upload');
    const outputContainer = document.getElementById('output-container');
    const statusMessage = document.getElementById('status-message');
    const downloadBtn = document.getElementById('download-btn');

    // Store the name of the converted file
    let convertedFilename = 'converted-document';

    // Listen for changes on the file input
    fileUpload.addEventListener('change', handleFileSelect, false);
    // Listen for clicks on the download button
    downloadBtn.addEventListener('click', downloadHtml, false);

    /**
     * Handles the file selection and initiates the conversion process.
     * @param {Event} event - The file input change event.
     */
    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        // Hide download button on new file selection
        downloadBtn.classList.add('hidden');

        // Handle .doc files with a specific error message
        if (file.name.toLowerCase().endsWith('.doc')) {
            statusMessage.textContent = 'Error: .doc files are not supported. Please re-save the file as .docx and try again.';
            statusMessage.classList.add('text-red-500');
            outputContainer.innerHTML = '<p class="text-gray-400">Your converted content will appear here...</p>';
            return;
        }

        // Check if the file is a .docx file
        if (!file.name.toLowerCase().endsWith('.docx')) {
            statusMessage.textContent = 'Error: Please select a valid .docx file.';
            statusMessage.classList.add('text-red-500');
            outputContainer.innerHTML = '<p class="text-gray-400">Your converted content will appear here...</p>';
            return;
        }
        
        // Store the original filename without the extension
        convertedFilename = file.name.replace(/\.docx$/i, '');

        // Clear previous status messages and output
        statusMessage.textContent = 'Converting...';
        statusMessage.classList.remove('text-red-500', 'text-green-600');
        outputContainer.innerHTML = '<p class="text-gray-400">Processing your document...</p>';

        const reader = new FileReader();

        reader.onload = async function(loadEvent) {
            const arrayBuffer = loadEvent.target.result;
            
            try {
                // Use mammoth.js to convert the ArrayBuffer to HTML
                const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                const html = result.value; // The generated HTML
                
                // Display the converted HTML in the output container
                outputContainer.innerHTML = html;
                statusMessage.textContent = 'Conversion successful!';
                statusMessage.classList.add('text-green-600');
                
                // Show the download button
                downloadBtn.classList.remove('hidden');

            } catch (error) {
                // Handle errors during conversion
                console.error('Mammoth.js conversion error:', error);
                outputContainer.innerHTML = '<p class="text-red-500">An error occurred during conversion. Please ensure it is a valid .docx file.</p>';
                statusMessage.textContent = 'Conversion failed.';
                statusMessage.classList.add('text-red-500');
            }
        };

        reader.onerror = function(error) {
            // Handle errors during file reading
            console.error('FileReader error:', error);
            outputContainer.innerHTML = '<p class="text-red-500">An error occurred while reading the file.</p>';
            statusMessage.textContent = 'File read error.';
            statusMessage.classList.add('text-red-500');
        };

        // Read the file as an ArrayBuffer
        reader.readAsArrayBuffer(file);
    }

    /**
     * Creates a Blob from the converted HTML and triggers a download.
     */
    function downloadHtml() {
        // Get the complete HTML content to be downloaded with responsive meta tag and styles
        const htmlToDownload = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${convertedFilename}</title>
<style>
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        color: #333;
    }
    img, video, table {
        max-width: 100%;
        height: auto;
    }
    h1, h2, h3, h4, h5, h6 {
        line-height: 1.2;
    }
    @media (max-width: 840px) {
        body {
            padding: 1rem;
        }
    }
</style>
</head>
<body>
${outputContainer.innerHTML}
</body>
</html>`;
        
        // Create a Blob, which is a file-like object of immutable, raw data
        const blob = new Blob([htmlToDownload], { type: 'text/html' });

        // Create a temporary URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${convertedFilename}.html`; // Set the filename for the download
        
        // Append the anchor to the body, click it, and then remove it
        document.body.appendChild(a);
        a.click();
        
        // Clean up by revoking the temporary URL and removing the anchor
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
});
