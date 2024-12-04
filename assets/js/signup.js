let currentStep = 1;

function showStep(step) {
    const steps = document.querySelectorAll('fieldset');
    steps.forEach((stepElem, index) => {
        stepElem.style.display = (index + 1 === step) ? 'block' : 'none';
    });

    // Show Previous button on steps after the first one
    document.getElementById('prevBtn').style.display = (step === 1) ? 'none' : 'inline';
    // Show Next button on steps before the last one
    document.getElementById('nextBtn').style.display = (step === steps.length) ? 'none' : 'inline';
    // Show Submit button on the last step
    document.getElementById('submitBtn').style.display = (step === steps.length) ? 'inline' : 'none';
}

function moveStep(stepDiff) {
    if (!validateCurrentStep()) {
        return; // Prevent moving to the next step if validation fails
    }

    currentStep += stepDiff;
    showStep(currentStep);
}

function validateCurrentStep() {
    const currentFieldset = document.querySelectorAll('fieldset')[currentStep - 1]; // Get the current step
    let hasEmptyFields = false;

    // Loop through each input element within the current step
    for (const input of currentFieldset.querySelectorAll('input, textarea')) {
        if (input.required && input.value.trim() === '') {
            hasEmptyFields = true;
            input.classList.add('error'); // Highlight the empty fields with the 'error' class
        } else {
            input.classList.remove('error'); // Remove the error class if the field is filled
        }
    }

    if (hasEmptyFields) {
        document.getElementById('error-message').innerText = 'Please fill in all required fields before moving to the next step!';
    } else {
        document.getElementById('error-message').innerText = '';
    }

    return !hasEmptyFields; // Return false if there are empty fields, preventing moving to the next step
}

// Function to submit the form with file uploads
function submitForm(event) {
    event.preventDefault(); // Prevent form from submitting normally

    const form = document.getElementById('registeredbiz');
    const formData = new FormData(form);

    // Get the submit button
    const submitButton = document.getElementById('submitBtn');
    
    // Change the button text to "Loading"
    submitButton.innerText = 'Loading...';
    submitButton.disabled = true; // Optionally disable the button to prevent multiple submissions

    // Handle the CAC certificate file upload
    const fileInputCAC = document.getElementById('myFileCAC');
    const fileCAC = fileInputCAC.files[0];  // Get the file from the input

    if (fileCAC) {
        const readerCAC = new FileReader();
        readerCAC.onload = function(event) {
            const base64fileCAC = event.target.result.split(',')[1]; // Get base64 string (exclude data URI part)
            formData.append('base64fileCAC', base64fileCAC);
            formData.append('fileCACName', fileCAC.name);  // Add file name to form data

            // Now handle the Business photo file upload
            const fileInput = document.getElementById('myFile');
            const file = fileInput.files[0]; // Get the file from input

            // If both files are selected, process them
            if (fileCAC && file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64file = event.target.result.split(',')[1]; // Get base64 string (exclude data URI part)
                    formData.append('base64file', base64file);
                    formData.append('fileName', file.name);

                    // Handle services selection (checkboxes or multi-select dropdown)
                    const selectedServices = [];
                    const serviceCheckboxes = document.querySelectorAll('input[name="services"]:checked'); // Get checked checkboxes
                    
                    serviceCheckboxes.forEach((checkbox) => {
                        selectedServices.push(checkbox.value);  // Append the selected service to the array
                    });
                    
                    // Log selected services for debugging
                    console.log("Selected services:", selectedServices);
                    
                    // Append selected services to the form data
                    formData.append('selectedServices', selectedServices.join(','));  // Join the selected services into a comma-separated string

                    // Submit the form data via Fetch API
                    fetch('https://script.google.com/macros/s/AKfycby0GFuLbUoom8jrmTLsp8MgtgG4UXMZAzw9ncqlQSpasU-eTES2UodENvRpc_4sklBZYg/exec', {
                        method: 'POST',
                        body: formData,
                    })
                    .then(response => response.json())  // Parse the response as JSON
                    .then(data => {
                        console.log("Response:", data);  // Log the response for inspection
                        if (data.status === 'success') {
                            showThankYouPage(data.message);  // Show a success message on successful submission
                        } else {
                            alert('Error: ' + data.message);  // Show error message if something goes wrong
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);  // Log any error
                        alert('An error occurred while submitting the form.');
                    })
                    .finally(() => {
                        // Restore the submit button text and enable it again after submission is complete
                        submitButton.innerText = 'Submit';
                        submitButton.disabled = false; // Re-enable the button
                    });
                };
                reader.readAsDataURL(file); // Read the business file as base64
            } else {
                // If no files are provided, submit the form without files
                fetch('https://script.google.com/macros/s/AKfycby0GFuLbUoom8jrmTLsp8MgtgG4UXMZAzw9ncqlQSpasU-eTES2UodENvRpc_4sklBZYg/exec', {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.json())  // Parse the response as JSON
                .then(data => {
                    console.log("Response:", data);  // Log the response for inspection
                    if (data.status === 'success') {
                        showThankYouPage(data.message);  // Show success message
                    } else {
                        alert('Error: ' + data.message);  // Show error message if submission fails
                    }
                })
                .catch(error => {
                    console.error('Error:', error);  // Log any error
                    alert('An error occurred while submitting the form.');
                })
                .finally(() => {
                    // Restore the submit button text and enable it again after submission is complete
                    submitButton.innerText = 'Submit';
                    submitButton.disabled = false; // Re-enable the button
                });
            }
        };
        readerCAC.readAsDataURL(fileCAC);  // Read the CAC file as base64
    } else {
        console.log("No CAC file selected.");
    }

    // Log form data before submission for debugging
    for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
    }
}





// Function to show "Thank You" message or redirect to another page
function showThankYouPage(cafId) {
    // Hide the form
    document.getElementById('registeredbiz').style.display = "none";

    // Show the success message
    const thankYouMessage = document.createElement('div');
    thankYouMessage.innerHTML = `<h2>Your Request Has Been Submitted Successfully!</h2><p><strong>${cafId}</strong> <br><br>  You can refer to your Email.<br> We will contact you shortly for verifications.</p>`;
    document.body.appendChild(thankYouMessage);

    // Optionally, redirect to a different page after a few seconds
    setTimeout(() => window.location.href = '/pages/services.html', 15000);
}

// Initialize the form by showing the first step
showStep(currentStep);
