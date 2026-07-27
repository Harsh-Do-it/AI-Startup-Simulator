import Card from "../ui/Card.jsx";

const steps = [
  ["01", "Submit Your Idea", "Fill in your startup name, industry, business model, and pricing details."],
  ["02", "Get AI Analysis", "Gemini evaluates your startup like a real VC — score, market potential, risks and more."],
  ["03", "Face the Investor Panel", "Enter the Investor Room and answer 10 tough investor questions in real time."],
  ["04", "Receive Your Verdict", "Get a final investment decision, funding probability, and actionable suggestions."],
];

export default function HowItWorks() {
  return (
    <section className="bg-surface-container px-4 py-20 border-y border-outline-variant/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold text-ink-900 sm:text-5xl">How It Works</h2>
          <p className="mt-4 text-on-surface-variant font-medium text-lg">
            From idea to investor-ready in four simple steps.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([number, title, text]) => (
            <Card key={number} className="text-center flex flex-col items-center h-full">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-800 font-data text-sm font-bold text-surface shadow-soft">
                {number}
              </div>
              <h3 className="font-headline font-semibold text-lg text-ink-900">{title}</h3>
              <p className="mt-2 text-sm text-on-surface-variant">{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
