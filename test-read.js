const pid = "c4d7ec93-f4c0-432b-9800-47b2b0ce814d"; // placeholder
async function main() {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'mark_read', product_id: pid, role_to_mark: 'ADMIN' })
  });
  const json = await res.json();
  console.log(json);
}
main();
