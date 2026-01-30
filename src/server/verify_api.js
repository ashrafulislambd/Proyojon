async function checkApi() {
    try {
        const res = await fetch('http://localhost:3000/api/products');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('First Product:', data[0]);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkApi();
