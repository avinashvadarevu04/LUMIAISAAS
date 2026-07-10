import os
import logging

logger = logging.getLogger(__name__)

# Initialize Stripe API Key
stripe_api_key = os.environ.get("STRIPE_SECRET_KEY", "").strip()

# Try to import stripe; fallback to mock logic if package not present or key is missing
stripe_client = None
if stripe_api_key:
    try:
        import stripe
        stripe.api_key = stripe_api_key
        stripe_client = stripe
        logger.info("Stripe successfully initialized with Secret Key.")
    except ImportError:
        logger.warning("Stripe package is not installed. Falling back to mock billing simulator.")
else:
    logger.info("Stripe Secret Key is not configured. Running in Mock billing mode.")


def create_stripe_session(
    milestone_id: str,
    amount: float,
    currency: str,
    project_name: str,
    client_email: str,
    success_url: str,
    cancel_url: str
) -> str:
    """
    Creates a Stripe Checkout Session for the milestone payment.
    Falls back to a simulated checkout redirect if Stripe is not configured.
    """
    if stripe_client:
        try:
            session = stripe_client.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": currency.lower(),
                            "product_data": {
                                "name": f"Milestone Payment: {project_name}",
                                "description": f"Milestone ID: {milestone_id}",
                            },
                            "unit_amount": int(amount * 100),  # Stripe expects cents/paisas
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                customer_email=client_email,
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={"milestone_id": milestone_id},
            )
            return session.url
        except Exception as e:
            logger.error(f"Stripe Session creation failed: {e}. Falling back to mock URL.")

    # Mock checkout fallback URL
    mock_url = (
        f"http://localhost:3000/billing/mock-checkout"
        f"?milestone_id={milestone_id}"
        f"&amount={amount}"
        f"&currency={currency}"
        f"&project_name={project_name}"
    )
    return mock_url
