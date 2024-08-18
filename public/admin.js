document.addEventListener('DOMContentLoaded', () => {
    // Fetch car details for the admin dashboard
    fetch('https://dinga-world-main.onrender.com/admin-dashboard')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const detailsList = document.getElementById('car-details-list');
            detailsList.innerHTML = ''; // Clear existing content
            data.forEach(detail => {
                const detailDiv = document.createElement('div');
                detailDiv.classList.add('car-detail');
                detailDiv.innerHTML = `
                    <h3>${detail.carBrand} ${detail.carModel}</h3>
                    <p>Model: ${detail.carModel}</p>
                    <p>Engine Capacity: ${detail.engineCapacity}</p>
                    <p>Transmission: ${detail.transmission}</p>
                    <p>Drivetrain: ${detail.drivetrain}</p>
                    <p>Year: ${detail.carYear}</p>
                    <p>Body Type: ${detail.bodyType}</p>
                    <div class="car-photos">
                        ${detail.carPhotos.map(photo => 
                            `<img src="${photo}" alt="${detail.carModel}" data-photos='${JSON.stringify(detail.carPhotos)}' />`
                        ).join('')}
                    </div>
                    <button onclick="approveCar('${detail.carBrand} ${detail.carModel}')">Approve</button>
                `;
                detailsList.appendChild(detailDiv);
            });

            // Event delegation for images
            detailsList.addEventListener('click', (event) => {
                if (event.target.tagName === 'IMG') {
                    const imageSrc = event.target.src;
                    const photos = JSON.parse(event.target.getAttribute('data-photos'));
                    showModal(imageSrc, photos);
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
            const detailsList = document.getElementById('car-details-list');
            detailsList.innerHTML = '<p>Failed to load car details. Please try again later.</p>';
        });
// Fetch and display quotes
fetch('https://dinga-world-main.onrender.com/get-quotes')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(quotes => {
        console.log('Fetched Quotes:', quotes); // Debugging log to check fetched data
        const quoteSection = document.createElement('div');
        quoteSection.classList.add('quote-section');
        quoteSection.innerHTML = '<h2>Quote Requests</h2>';
        
        if (quotes.length === 0) {
            quoteSection.innerHTML += '<p>No quotes available.</p>';
        } else {
            quotes.forEach(quote => {
                const quoteDiv = document.createElement('div');
                quoteDiv.classList.add('quote-detail');
                quoteDiv.innerHTML = `
                    <p>Car: ${quote.carId}</p>
                    <p>Name: ${quote.name}</p>
                    <p>Email: ${quote.email}</p>
                    <p>Phone: ${quote.phone}</p>
                    <button onclick="viewQuoteDetails('${quote.timestamp}')">View Details</button>
                `;
                quoteSection.appendChild(quoteDiv);
            });
        }

        document.querySelector('.admin-dashboard').appendChild(quoteSection);
    })
    .catch(error => {
        console.error('Error:', error);
        const quoteSection = document.createElement('div');
        quoteSection.innerHTML = '<p>Failed to load quotes. Please try again later.</p>';
        document.querySelector('.admin-dashboard').appendChild(quoteSection);
    });

    // Function to show the modal with the selected photo
    function showModal(imageSrc, photos) {
        const modal = document.getElementById('photo-modal');
        const modalImg = document.getElementById('modal-img');
        const caption = document.getElementById('caption');
        const prevBtn = document.getElementById('prev-photo');
        const nextBtn = document.getElementById('next-photo');

        let currentIndex = photos.indexOf(imageSrc);

        // Ensure the modal content updates before displaying the modal
        function updateModal() {
            modalImg.src = photos[currentIndex];
            caption.innerHTML = `Image ${currentIndex + 1} of ${photos.length}`;
        }

        // Update the modal content and show it
        updateModal();
        modal.style.display = 'block';

        prevBtn.onclick = function() {
            if (currentIndex > 0) {
                currentIndex--;
                updateModal();
            }
        };

        nextBtn.onclick = function() {
            if (currentIndex < photos.length - 1) {
                currentIndex++;
                updateModal();
            }
        };
    }

    // Function to close the modal
    function closeModal() {
        const modal = document.getElementById('photo-modal');
        modal.style.display = 'none';
    }

    // Event listener for closing the modal
    document.querySelector('.modal .close').onclick = closeModal;

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        const modal = document.getElementById('photo-modal');
        if (event.target === modal) {
            closeModal();
        }
    };
});

// Function to handle car approval
function approveCar(carName) {
    fetch('https://dinga-world-main.onrender.com/approve-car', {  
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
        alert('Approved: ' + carName);
        // Optionally, you can remove the approved item from the list or refresh the page
        location.reload(); // Reload the page to update the list
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to approve car.');
    });
}

// Function to view quote details
function viewQuoteDetails(timestamp) {
    // Logic to fetch and display specific quote details can go here
    alert('Viewing details for quote submitted at: ' + timestamp);
}