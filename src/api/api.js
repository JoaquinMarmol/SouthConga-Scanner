// pages/api/submit.js
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { qrData } = req.body;
    // Aquí puedes procesar el qrData como desees, por ejemplo, guardarlo en una base de datos
    console.log('QR Data received:', qrData);
    res.status(200).json({ message: 'QR data received successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
