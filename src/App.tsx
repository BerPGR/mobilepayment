import { useRef, type FormEvent, type JSX } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY); // substitua pela sua public key

function CardForm(): JSX.Element {
  const stripe = useStripe();
  const elements = useElements();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchElements] = useSearchParams();

  const bearerToken = searchElements.get("token");
  const payment_method = searchElements.get("payment_method");
  const amount = searchElements.get("amount");
  const property_id = searchElements.get("property_id");
  const quantity = searchElements.get("quantity");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, token } = await stripe.createToken(cardElement);

    if (error) {
      alert(error.message);
    } else if (token) {
      try {
        const response = await axios.post(
          "http://localhost:8000/api/V2/payment/create",
          {
            amount,
            payment_method,
            token: token.id,
            property_id,
            quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = response.data;

        console.log('====================================');
        console.log(result);
        console.log('====================================');
        if (result?.success === true) {
          window.location.href = `ecolife://orders/${token.id}`;
        } else {
          alert(result?.payment_status || "Erro ao processar o pagamento.");
        }
      } catch (error: any) {
        console.error("Erro ao enviar requisição:", error);
        alert("Erro ao enviar pagamento. Verifique o console.");
      }
      //try {
      //  const result = JSON.parse(text)
      //  console.log('====================================');
      //  console.log(result);
      //  console.log('====================================');
      //  if (result?.success === true) {
      //    window.location.href = `ecolife://orders/${token.id}`;
      //  } else {
      //    alert(result?.payment_status);
      //  }
      //} catch (e) {
      //  alert(e);
      //}
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
