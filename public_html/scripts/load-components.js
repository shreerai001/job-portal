document.addEventListener("DOMContentLoaded", () => {
    const greetingElement = document.createElement('p');
    const currentHour = new Date().getHours();
    let greeting = 'Welcome!';

    if (currentHour < 12) {
        greeting = 'Good Morning!';
    } else if (currentHour < 18) {
        greeting = 'Good Afternoon!';
    } else {
        greeting = 'Good Evening!';
    }

    greetingElement.textContent = greeting;
    greetingElement.className = 'text-center text-primary mt-3';
    document.querySelector('header').appendChild(greetingElement);
    function loadComponent(component, target) {
        fetch(`components/${component}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${component}.html`);
                }
                return response.text();
            })
            .then(data => {
                document.querySelector(target).innerHTML = data;
                // Attach search form handler if this is the search_jobs component
                if (component === 'search_jobs') {
                    attachSearchFormHandler();
                }
                // Attach contact form handler if this is the contact component
                if (component === 'contact') {
                    attachContactFormHandler();
                }
            })
            .catch(error => console.error("Error loading component:", error));
    }

    function attachSearchFormHandler() {
        const searchForm = document.getElementById('searchJobsForm');
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const query = document.getElementById('searchQuery').value.trim();
                const jobsList = document.getElementById('jobs-list');
                if (!query) {
                    if (jobsList) jobsList.innerHTML = '<div class="col-12"><div class="alert alert-warning">Please enter a search term.</div></div>';
                    return;
                }
                fetch(`/api/jobs/search?query=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (jobsList) {
                            jobsList.innerHTML = '';
                            if (data.success && data.jobs.length > 0) {
                                data.jobs.forEach(job => {
                                    const col = document.createElement('div');
                                    col.className = 'col-md-4 mb-4';
                                    col.innerHTML = `
                                      <div class="card h-100">
                                        <div class="card-body d-flex flex-column">
                                          <h5 class="card-title">${job.title}</h5>
                                          <p class="card-text mb-1"><strong>Company:</strong> ${job.company}</p>
                                          <p class="card-text mb-1"><strong>Location:</strong> ${job.location || 'N/A'}</p>
                                          <p class="card-text mb-2">${job.description ? job.description.substring(0, 100) + (job.description.length > 100 ? '...' : '') : ''}</p>
                                          <div class="mt-auto">
                                            <a href="#" class="btn btn-primary view-details-btn" data-job-id="${job.id}">View Details</a>
                                          </div>
                                        </div>
                                        <div class="card-footer text-muted small">
                                          Posted: ${job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'N/A'}
                                          ${job.salary ? `<span class='float-end'><strong>Salary:</strong> ${job.salary}</span>` : ''}
                                        </div>
                                      </div>
                                    `;
                                    jobsList.appendChild(col);
                                });
                                // Attach click event to all view details buttons
                                document.querySelectorAll('.view-details-btn').forEach(btn => {
                                    btn.addEventListener('click', function(e) {
                                        e.preventDefault();
                                        const jobId = this.getAttribute('data-job-id');
                                        window.location.href = `components/job_details.html?jobId=${jobId}`;
                                    });
                                });
                            } else {
                                jobsList.innerHTML = '<div class="col-12"><div class="alert alert-info">No jobs found for your search.</div></div>';
                            }
                        }
                    })
                    .catch(() => {
                        if (jobsList) jobsList.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to search jobs.</div></div>';
                    });
            });
        }
    }

    function attachContactFormHandler() {
        // Only select the form inside the contact component
        const contactSection = document.querySelector('.col-md-6 form');
        if (!contactSection) return;
        contactSection.addEventListener('submit', async function (e) {
            e.preventDefault();
            // Collect form data
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const postcode = document.getElementById('postcode').value.trim();
            const company = document.getElementById('company').value.trim();
            const message = document.getElementById('message').value.trim();
            // Simple validation
            if (!name || !email || !phone || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, address, postcode, company, message })
                });
                const data = await response.json();
                if (data.success) {
                    alert('Your message has been sent!');
                    contactSection.reset();
                } else {
                    alert(data.message || 'Failed to send message.');
                }
            } catch (err) {
                alert('Server error. Please try again later.');
            }
        });
    }

    function loadJobs() {
        fetch('/api/jobs')
            .then(res => res.json())
            .then(data => {
                const jobsList = document.getElementById('jobs-list');
                if (!jobsList) return;
                jobsList.innerHTML = '';
                if (data.success && data.jobs.length > 0) {
                    data.jobs.forEach(job => {
                        const col = document.createElement('div');
                        col.className = 'col-md-4 mb-4';
                        col.innerHTML = `
                          <div class="card h-100">
                            <div class="card-body d-flex flex-column">
                              <h5 class="card-title">${job.title}</h5>
                              <p class="card-text mb-1"><strong>Company:</strong> ${job.company}</p>
                              <p class="card-text mb-1"><strong>Location:</strong> ${job.location || 'N/A'}</p>
                              <p class="card-text mb-2">${job.description ? job.description.substring(0, 100) + (job.description.length > 100 ? '...' : '') : ''}</p>
                              <div class="mt-auto">
                                <a href="#" class="btn btn-primary view-details-btn" data-job-id="${job.id}">View Details</a>
                              </div>
                            </div>
                            <div class="card-footer text-muted small">
                              Posted: ${job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'N/A'}
                              ${job.salary ? `<span class='float-end'><strong>Salary:</strong> ${job.salary}</span>` : ''}
                            </div>
                          </div>
                        `;
                        jobsList.appendChild(col);
                    });
                    // Attach click event to all view details buttons
                    document.querySelectorAll('.view-details-btn').forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            const jobId = this.getAttribute('data-job-id');
                            window.location.href = `components/job_details.html?jobId=${jobId}`;
                        });
                    });
                } else {
                    jobsList.innerHTML = '<div class="col-12"><div class="alert alert-info">No jobs found.</div></div>';
                }
            })
            .catch(() => {
                const jobsList = document.getElementById('jobs-list');
                if (jobsList) jobsList.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to load jobs.</div></div>';
            });
    }

    function loadSidebarCompanies() {
        fetch('/api/sidebar/companies')
            .then(res => res.json())
            .then(data => {
                const sidebar = document.getElementById('sidebar');
                if (!sidebar) return;
                let html = '<h4 class="text-start mb-4">Top IT Companies</h4><ul class="list-group">';
                if (data.success && data.companies.length > 0) {
                    data.companies.forEach(company => {
                        html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="fw-bold">${company.company}</span>
                            <span class="badge bg-primary rounded-pill">${company.jobCount} Jobs</span>
                        </li>`;
                    });
                } else {
                    html += '<li class="list-group-item">No companies found.</li>';
                }
                html += '</ul>';
                sidebar.innerHTML = html;
            })
            .catch(() => {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.innerHTML = '<div class="alert alert-danger">Failed to load companies.</div>';
            });
    }

    function loadPage(page) {
        fetch(`components/${page}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${page}.html`);
                }
                return response.text();
            })
            .then(data => {
                const mainElement = document.querySelector("main");
                if (mainElement) {
                    mainElement.innerHTML = data;
                    updateActiveLink(page); 
                    attachEventListeners(); 
                    if (page === 'jobs') loadJobs(); // Load jobs if jobs page
                    if (page === 'contact') attachContactFormHandler(); // Attach contact form handler if contact page
                } else {
                    console.error("Main element not found in the DOM.");
                }
            })
            .catch(error => console.error("Error loading page:", error));
    }

    function updateActiveLink(page) {
        document.querySelectorAll("[data-page]").forEach(link => {
            if (link.getAttribute("data-page") === page) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }

    function attachEventListeners() {
        const links = document.querySelectorAll("[data-page]");
        if (links.length === 0) {
            console.warn("No links with data-page attribute found.");
        }
        links.forEach(link => {
            link.addEventListener("click", event => {
                event.preventDefault();
                const page = event.target.getAttribute("data-page");
                if (page) {
                    loadPage(page);
                } else {
                    console.error("data-page attribute is missing on the clicked link.");
                }
            });
        });
    }

    loadComponent("sidebar", "#sidebar");
    setTimeout(loadSidebarCompanies, 400); // Ensure sidebar is loaded before populating
    loadComponent("search_jobs", "#search-jobs");

    loadPage("home");

    attachEventListeners();
});