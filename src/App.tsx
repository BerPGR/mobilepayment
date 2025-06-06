import { useRef, type FormEvent, type JSX } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useSearchParams } from "react-router-dom";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY); // substitua pela sua public key

function CardForm(): JSX.Element {
  const stripe = useStripe();
  const elements = useElements();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchElements] = useSearchParams();

  const bearerToken = searchElements.get('token')
  const payment_method = searchElements.get('payment_method')
  const amount = searchElements.get('amount')
  const property_id = searchElements.get('property_id')
  const quantity = searchElements.get('quantity')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, token } = await stripe.createToken(cardElement);

    if (error) {
      alert(error.message);
    } else if (token) {
      const data = await fetch("https://homologacao.ecolifemeioambiente.com.br/api/V2/payment/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${bearerToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount,
          payment_method,
          token: token.id,
          property_id,
          quantity
        })
      })

      const result = await data.json();

      if (result?.status === true){
        window.location.href = `ecolife://orders/${token.id}`;
      }
      else {
        alert(result?.payment_status)
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Pagamento com Cartão
        </h2>
        <div>
          <ul>
            <li>R${amount}</li>
            <li>{quantity} Créditos de Carbono</li>
          </ul>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 border rounded-lg">
            <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-lg"
          >
            Gerar Token
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StripePage(): JSX.Element {
  return (
    <Elements stripe={stripePromise}>
      <CardForm />
    </Elements>
  );
}
