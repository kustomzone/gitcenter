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

repo.addMerger()
	.then(() => {
		return repo.getContent();
	})
	.then(content => {
		showTitle(content.title);
		showBranches();
		showPath(false);

		return repo.getFiles("master", path);
	})
	.then(files => {
		let table = document.getElementById("files");
		files
			.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
			.forEach(file => {
				let tr = document.createElement("tr");
				tr.onclick = () => {
					if(file.type == "unknown") {
						return;
					}

					location.href = (
						(file.type == "file" ? "file/" : "") +
						"?" + address +
						"/" + ((path ? path + "/" : "") + file.name).replace(/@/g, "@@") +
						"@" + branch.replace(/@/g, "@@")
					);
				};

				let name = document.createElement("td");
				name.textContent = file.name;
				tr.appendChild(name);

				let icon = document.createElement("img");
				icon.className = "file-icon";
				icon.src = "../img/" + file.type + ".svg";
				name.insertBefore(icon, name.firstChild);

				table.appendChild(tr);
			});

		let filesBack = document.getElementById("files_back");
		if(path == "" || path == "/") {
			filesBack.style.display = "none";
		} else {
			filesBack.onclick = () => {
				let parts = path.split("/").filter(part => part.length);
				parts.pop();
				location.href = "?" + address + "/" + parts.join("/").replace(/@/g, "@@") + "@" + branch.replace(/@/g, "@@");
			};
		}
	});