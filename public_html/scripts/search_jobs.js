document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('searchForm');
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'container my-4';
    form.parentNode.appendChild(resultsContainer);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = document.getElementById('searchQuery').value.trim();
        resultsContainer.innerHTML = '<div class="text-center my-3"><div class="spinner-border text-primary"></div></div>';
        fetch(`/api/jobs/search?query=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.jobs.length > 0) {
                    resultsContainer.innerHTML = '<div class="row g-4"></div>';
                    const row = resultsContainer.querySelector('.row');
                    data.jobs.forEach(job => {
                        row.innerHTML += `
                            <div class="col-md-4">
                                <div class="card shadow-sm mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title">${job.title}</h5>
                                        <p class="card-text mb-1"><strong>Company:</strong> ${job.company}</p>
                                        <p class="card-text mb-1"><strong>Location:</strong> ${job.location || 'N/A'}</p>
                                        <p class="card-text text-muted mb-1"><strong>Posted:</strong> ${job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'N/A'}</p>
                                        <a href="job_details.html?jobId=${job.id}" class="btn btn-outline-primary btn-sm mt-2">View Details</a>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    resultsContainer.innerHTML = '<div class="alert alert-info text-center">No jobs found.</div>';
                }
            })
            .catch(() => {
                resultsContainer.innerHTML = '<div class="alert alert-danger text-center">Failed to search jobs.</div>';
            });
    });
});