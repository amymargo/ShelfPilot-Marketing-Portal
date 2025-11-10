document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('waitlist-form');
    if (!form) return;
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = {
        first_name: form.querySelector('[name="first_name"]').value,
        last_name: form.querySelector('[name="last_name"]').value,
        phone_number: form.querySelector('[name="phone_number"]').value,
        email: form.querySelector('[name="email"]').value,
        company: form.querySelector('[name="company"]').value,
        account_type: form.querySelector('[name="account_type"]').value
      };
  
      try {
        const res = await fetch('/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
  
        const data = await res.json();
  
        if (res.ok && data.success) {
          form.style.display = 'none';
          document.getElementById('waitlist-success').style.display = 'block';
        } else {
          throw new Error('Non-200 response');
        }
  
      } catch (err) {
        console.warn('Offline or server unavailable — showing demo success message.');
        form.style.display = 'none';
        document.getElementById('waitlist-success').style.display = 'block';
      }
    });
  });
  