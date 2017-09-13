function showTitle(title) {
	let name = document.getElementById("repo_name");
	name.textContent = title;
	name.innerHTML += document.getElementById("edit_icon_tmpl").innerHTML;

	document.getElementById("edit_icon").onclick = renameRepo;
}

function showBranches() {
	return repo.getBranches()
		.then(list => {
			// Show branch list
			let branches = document.getElementById("branches");
			list.forEach(branch => {
				let option = document.createElement("option");
				option.textContent = branch;
				branches.appendChild(option);
			});

			branches.value = branch;

			branches.onchange = () => {
				location.href = "?" + address + "/" + path.replace(/@/g, "@@") + "@" + branches.value.replace(/@/g, "@@");
			};
		});
}

function showPath() {
	// Show path
	document.getElementById("files_root").href = "../?" + address;

	let filesPath = document.getElementById("files_path");
	let parts = path.split("/").filter(part => part.length);
	parts.forEach((part, i) => {
		let node = document.createElement("span");
		node.textContent = i == parts.length - 1 ? "" : " › ";

		let link = document.createElement(i == parts.length - 1 ? "span" : "a");
		link.textContent = part;
		if(i < parts.length - 1) {
			link.href = "../?" + address + "/" + parts.slice(0, i + 1).join("/");
		}
		node.insertBefore(link, node.firstChild);

		filesPath.appendChild(node);
	});
}

function renameRepo() {
	let newName;
	return zeroPage.prompt("New name:")
		.then(n => {
			newName = n;

			return repo.rename(newName);
		})
		.then(() => showTitle(newName));
}