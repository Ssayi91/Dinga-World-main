// Menu toggle and header activation based on scroll position
let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
};

window.onload = () => {
    if (window.scrollY > 0) {
        document.querySelector('.header').classList.add('active');
    } else {
        document.querySelector('.header').classList.remove('active');
    }
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
};

// Login form toggle
document.querySelector('#login-btn').onclick = () => {
    document.querySelector('.login-form-container').classList.toggle('active');
};
document.querySelector('#close-login-form').onclick = () => {
    document.querySelector('.login-form-container').classList.remove('active');
};

// Sell your car form toggle
document.getElementById("btn1").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("sell-car-form").style.display = "flex";
});

document.getElementById("close-form").addEventListener("click", function () {
    document.getElementById("sell-car-form").style.display = "none";
});

// Form submission with feedback message handling
document.getElementById("sell-car-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('https://dinga-world-main.onrender.com/submit-car-details', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const feedbackMessage = document.getElementById("feedback-message");
            feedbackMessage.style.display = "block";
            feedbackMessage.textContent = data.message;
            feedbackMessage.style.color = "darkred"; // Optional: Change color to green for success
            this.reset(); // Optionally reset the form after successful submission
            
            // Show feedback message for 5 seconds, then fade out
            setTimeout(() => {
                feedbackMessage.style.opacity = 0;
                setTimeout(() => {
                    feedbackMessage.style.display = "none";
                    feedbackMessage.style.opacity = 1; // Reset opacity for future messages
                }, 2000); // Duration for the fade-out effect
            }, 5000); // Duration for showing the message
        })
        .catch(error => {
            console.error('Error:', error);
            const feedbackMessage = document.getElementById("feedback-message");
            feedbackMessage.style.display = "block";
            feedbackMessage.textContent = 'Submission failed. Please try again.';
            feedbackMessage.style.color = "darkblue"; // Change color to darkblue for errors
        });
});

// Fetch approved car details from the backend and populate the frontend
fetch('https://dinga-world-main.onrender.com/approved-cars')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const carList = document.getElementById('approved-car-list');
        carList.innerHTML = ''; // Clear any existing content
        data.forEach(detail => {
            const detailDiv = document.createElement('div');
            detailDiv.classList.add('car-detail', 'swiper-slide');
            detailDiv.setAttribute('data-car-name', detail.carBrand + ' ' + detail.carModel); // Add data attribute for the car name
            detailDiv.innerHTML = `
                <h3>${detail.carBrand} ${detail.carModel}</h3>
                <p>Model: ${detail.carModel}</p>
                <p>Engine Capacity: ${detail.engineCapacity}</p>
                <p>Transmission: ${detail.transmission}</p>
                <p>Drivetrain: ${detail.drivetrain}</p>
                <p>Year: ${detail.carYear}</p>
                <p>Body Type: ${detail.bodyType}</p>
                <div class="car-photos">
                    ${detail.carPhotos.map(photo => `<img src="https://dinga-world-main.onrender.com${photo}" alt="${detail.carModel}" onerror="this.onerror=null; this.src='/images/default-car.jpg'" />`).join('')}
                </div>
                <button class="get-quote-btn" data-car-name="${detail.carBrand} ${detail.carModel}">Get a Quote</button>
                <form class="quote-form" style="display: none;">
                    <h4>Request a Quote</h4>
                    <input type="text" name="name" placeholder="Your Name" required>
                    <input type="email" name="email" placeholder="Your Email" required>
                    <input type="tel" name="phone" placeholder="Your Phone Number" required>
                    <input type="hidden" name="car" value="${detail.carBrand} ${detail.carModel}">
                    <button type="submit">Submit</button>
                </form>
            `;
            carList.appendChild(detailDiv);
        });
             // Add event listener for Get a Quote buttons
             document.querySelectorAll('.get-quote-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const carName = this.getAttribute('data-car-name');
                    openQuoteForm(carName);
                });
            });
        })
    .catch(error => {
        console.error('Error:', error);
        const carList = document.getElementById('approved-car-list');
        carList.innerHTML = '<p>Failed to load approved car details. Please try again later.</p>';
    });

// Function to open quote form
function openQuoteForm(carName) {
    // Find the button's parent div
    const button = document.querySelector(`.get-quote-btn[data-car-name="${carName}"]`);
    if (!button) {
        console.error('Button not found for carName:', carName);
        return;
    }

    // Find the form within the same parent div
    const form = button.nextElementSibling; // Assuming the form follows the button
    if (form && form.classList.contains('quote-form')) {
        // Set the hidden input's value
        const carNameInput = form.querySelector('input[name="car"]');
        if (carNameInput) {
            carNameInput.value = carName;
            form.style.display = 'block'; // Show the form
        } else {
            console.error('Input for car name not found in the form.');
        }
    } else {
        console.error('Form not found or incorrect form class.');
    }
}

// Function to handle car approval
function approveCar(carName) {
    console.log(`Approving car: ${carName}`); // Log approval action
    fetch('https://dinga-world-main.onrender.com/approved-car', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carName })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Approval response:', data);
            alert('Approved: ' + carName);
            
            // Remove the approved car element without reloading
            document.querySelector(`#approved-car-list .car-detail[data-car-name="${carName}"]`).remove();
        })
        .catch(error => {
            console.error('Error approving car:', error);
            alert('Failed to approve car.');
        });
}
// search button function

document.getElementById('search-button').addEventListener('click', async() => {
    // Collect input values
    const brand = document.getElementById('car-brand').value.trim();
    const model = document.getElementById('car-model').value.trim();
    const transmission = document.getElementById('transmission').value;
    const minYear = document.getElementById('min-year').value;
    const maxYear = document.getElementById('max-year').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;

    // Prepare the query parameters
    const queryParams = new URLSearchParams();

    if (brand) queryParams.append('brand', brand);
    if (model) queryParams.append('model', model);
    if (transmission) queryParams.append('transmission', transmission);
    if (minYear) queryParams.append('minYear', minYear);
    if (maxYear) queryParams.append('maxYear', maxYear);
    if (minPrice) queryParams.append('minPrice', minPrice);
    if (maxPrice) queryParams.append('maxPrice', maxPrice);

   // Fetch search results from the backend
   try {
    const response = await fetch(`https://dinga-world-main.onrender.com/api/search?${queryParams.toString()}`);
    const data = await response.json();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (!Array.isArray(data) || data.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }

    data.forEach(car => {
        const carElement = document.createElement('div');
        carElement.classList.add('car-result');
        carElement.innerHTML = `
            <h3>${car.carBrand} ${car.carModel}</h3>
            <p>Year: ${car.carYear}</p>
            <p>Price: $${car.carPrice}</p>
            <p>Transmission: ${car.transmission}</p>
            <div class="car-images">
                ${car.carPhotos.map(photo => `<img src="${photo}" alt="${car.carBrand} ${car.carModel}">`).join('')}
            </div>
        `;
        resultsContainer.appendChild(carElement);
    });
} catch (error) {
    console.error('Error fetching search results:', error);
}
});



// JavaScript for Lightbox
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    let currentIndex = 0;
    let images = [];

    // Open lightbox
    document.querySelectorAll('.car-photos img').forEach((img, index) => {
        img.addEventListener('click', () => {
            lightbox.style.display = 'flex';
            lightboxImage.src = img.src;
            currentIndex = index;
            images = Array.from(document.querySelectorAll('.car-photos img')).map(img => img.src);
        });
    });

    // Close lightbox
    // lightboxClose.addEventListener('click', () => {
    //     lightbox.style.display = 'none';
    // });

    // Navigate to previous image
    lightboxPrev.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
        lightboxImage.src = images[currentIndex];
    });

    // Navigate to next image
    lightboxNext.addEventListener('click', () => {
        currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
        lightboxImage.src = images[currentIndex];
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
});
