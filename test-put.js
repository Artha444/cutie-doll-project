const pid = "140d2172-63c8-41a8-9428-862e74bc850f";
async function main() {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'mark_read', product_id: pid, role_to_mark: 'ADMIN' })
  });
  console.log(await res.json());
}
main();
