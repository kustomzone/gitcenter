let zeroFrame = new ZeroFrame();
let zeroPage = new ZeroPage(zeroFrame);

let address = location.search.replace(/[?&]wrapper_nonce=.*/, "").replace("?", "");
if(!address) {
	location.href = "..";
}

let path = "";
if(address.indexOf("/") > -1) {
	path = address.substr(address.indexOf("/") + 1);
	address = address.substr(0, address.indexOf("/"));
}

let branch = "master";
if(path.indexOf("@") > -1) {
	let tempPath = path.replace(/@@/g, "\0"); // @ is escaped
	path = tempPath.substr(0, tempPath.indexOf("@")).replace(/\0/g, "@");
	branch = tempPath.substr(tempPath.indexOf("@") + 1).replace(/\0/g, "@");
} else {
	path = path.replace(/@@/g, "@");
}

let repo = new Repository(address, zeroPage);


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

function showPath(isCurrentFile) {
	// Show path
	document.getElementById("files_root").href = (isCurrentFile ? "../?" + address : "?" + address) + "@" + branch.replace(/@/g, "@@");

	let filesPath = document.getElementById("files_path");
	let parts = path.split("/").filter(part => part.length);
	parts.forEach((part, i) => {
		let node = document.createElement("span");
		node.textContent = i == parts.length - 1 ? "" : " › ";

		let link = document.createElement(i == parts.length - 1 ? "span" : "a");
		link.textContent = part;
		if(!isCurrentFile) {
			link.href = "?" + address + "/" + parts.slice(0, i + 1).join("/").replace(/@/g, "@@") + "@" + branch.replace(/@/g, "@@");
		} else if(i < parts.length - 1) {
			link.href = "../?" + address + "/" + parts.slice(0, i + 1).join("/").replace(/@/g, "@@") + "@" + branch.replace(/@/g, "@@");
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