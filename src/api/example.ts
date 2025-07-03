// Example API call to backend
export async function getHealth() {
  const res = await fetch('http://localhost:3001/api/health');
  return res.json();
}
