const docs = [
  { title: "Vendor Contract - Acme Corp", documentType: "Contract", ownerUsername: "admin", documentNumber: "DOC-1001" },
  { title: "Employee Onboarding - J. Smith", documentType: "HR", ownerUsername: "admin", documentNumber: "DOC-1002" },
  { title: "Q3 Marketing Budget", documentType: "Expense", ownerUsername: "admin", documentNumber: "DOC-1003" }
];

async function seed() {
  for (const doc of docs) {
    const res = await fetch("http://localhost:8081/api/v1/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc)
    });
    console.log(await res.text());
  }
}

seed();
