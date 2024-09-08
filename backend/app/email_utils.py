import yagmail

def send_order_confirmation_email(customer_email, order_details):
    sender_email = "infobiteway@gmail.com"
    password = "pfht lqpm belh iaim"

    yag = yagmail.SMTP(sender_email, password)

    subject = "Order Confirmation"
    body = f"""
    <h2>Thank you for your order!</h2>
    <p>Your order has been successfully placed.</p>
    <p>Order Details:</p>
    <ul>
        {"".join([f"<li>{item['name']} x {item['quantity']}</li>" for item in order_details])}
    </ul>
    <p>Total Price: ${sum(item['price'] * item['quantity'] for item in order_details)}</p>
    """

    try:
        yag.send(to=customer_email, subject=subject, contents=body)
        print("Order confirmation email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")
