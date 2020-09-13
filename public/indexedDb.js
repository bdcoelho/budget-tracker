let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  db.createObjectStore("offlineTran", { autoIncrement: true });
};

request.onsuccess = (event) => {
  db = event.target.result;
  if (navigator.onLine) {
    updateDatabase();
  }
};
request.onerror = (event) => {
  console.log(event.target.errorCode);
};
const saveRecord = (record) => {
  const transaction = db.transaction(["offlineTran"], "readwrite");
  const store = transaction.objectStore("offlineTran");
  store.add(record);
};

const updateDatabase = () => {
  const transaction = db.transaction(["offlineTran"], "readwrite");
  const store = transaction.objectStore("offlineTran");
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["offlineTran"], "readwrite");
          const store = transaction.objectStore("offlineTran");
          store.clear();
        });
    }
  };
};

window.addEventListener("online", updateDatabase);
