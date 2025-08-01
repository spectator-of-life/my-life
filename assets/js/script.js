// Function to format date
function formatDate(dateString) {
	const options = { year: "numeric", month: "long", day: "numeric" };
	return new Date(dateString).toLocaleDateString("en-US", options);
}

// Function to get URL parameters
function getUrlParameter(name) {
	name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
	const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
	const results = regex.exec(location.search);
	return results === null
		? ""
		: decodeURIComponent(results[1].replace(/\+/g, " "));
}


async function renderBlogGrid() {
	const blogGrid = document.getElementById("blogGrid");
	if (!blogGrid) return;

	try {
		const res = await fetch('https://raw.githubusercontent.com/spectator-of-life/my-life/main/assets/data/posts.json');
		const blogPosts = await res.json();

		// Sort by newest first
		const sortedBlogs = blogPosts.sort(
			(a, b) => new Date(b.date) - new Date(a.date)
		);

		blogGrid.innerHTML = sortedBlogs.map(blog => `
			<div class="blog-card" onclick="navigateToBlog(${blog.id})">
				<div class="blog-content">
					<div class="blog-date">${formatDate(blog.date)}</div>
					<h3 class="blog-title">${blog.title}</h3>
					<p class="blog-excerpt">${blog.excerpt}</p>
					<span class="read-more">Read More</span>
				</div>
			</div>
		`).join('');
	} catch (err) {
		console.error("Failed to load blog posts:", err);
		blogGrid.innerHTML = "<p>Failed to load blog posts.</p>";
	}
}

async function renderBlogPost() {
	const blogId = getUrlParameter("id");
	const mdPath = `https://raw.githubusercontent.com/spectator-of-life/my-life/main/posts/${blogId}.md`; // Replace with dynamic path based on blogId if needed

	try {
		const response = await fetch(mdPath);
		if (!response.ok) throw new Error("Post not found");

		const markdown = await response.text();
		const htmlContent = marked.parse(markdown);

		// Optional: extract title, date, image from the markdown
		const titleMatch = markdown.match(/^# (.+)$/m);
		const dateMatch = markdown.match(/\*\*Date:\*\* (.+)/);
		// const imageMatch = markdown.match(/\*\*Image:\*\* (.+)/);

		const title = titleMatch ? titleMatch[1] : "Untitled Post";
		const date = dateMatch ? dateMatch[1] : "Unknown Date";
		// const image = imageMatch ? imageMatch[1].trim() : "";

		document.getElementById("blogTitle").textContent = `${title} - Life Stories`;

		document.getElementById("blogPost").innerHTML = `
			<div class="blog-post-content">
				<div class="blog-post-date">${date}</div>
				<h1 class="blog-post-title">${title}</h1>
				<div class="blog-post-text">${htmlContent}</div>
			</div>
		`;
	} catch (err) {
		console.error(err);
		document.getElementById("blogPost").innerHTML = "<p>Blog post not found.</p>";
	}
}


// Function to navigate to blog post
function navigateToBlog(blogId) {
	window.location.href = `blog.html?id=${blogId}`;
}

// Initialize the appropriate page
document.addEventListener("DOMContentLoaded", () => {
	if (window.location.pathname.includes("blog.html")) {
		renderBlogPost();
	} else {
		renderBlogGrid();
	}
});
