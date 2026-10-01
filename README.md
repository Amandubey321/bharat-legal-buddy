# Bharat Legal Buddy

Build a production-ready AI Legal Rights Assistant for India that helps citizens understand the Constitution, laws, legal rights, and basic legal procedures in simple language.

CORE FEATURES:
- AI legal Q&A for Indian laws (Constitution of India, Bharatiya Nyaya Sanhita / BNS, Bharatiya Nagarik Suraksha Sanhita / BNSS, Bharatiya Sakshya Adhiniyam / BSA, Consumer Protection Act, IT Act, Labour laws, etc.)
- Explain Fundamental Rights, Constitutional provisions, Acts, sections, and legal terms in simple Hindi and English
- Support Hindi + English + major Indian languages (exclude Urdu)
- Searchable Constitution of India + important Central and State laws
- Explain "What are my rights?" based on user situation with quick categories: Police & FIR, Arrest, Bail, Cybercrime, Consumer rights, Employment/Labour, Property/Tenancy, Women & Child rights, RTI, Traffic violations
- Provide relevant law/section/article references with verified source links
- Step-by-step guidance for common legal situations (how to file an e-FIR/Zero FIR, steps on detention/arrest, consumer forum complaints)
- Generate complaint / application / RTI (Section 6(1)) / legal notice drafts with clear disclaimers and export/copy
- Case-law and Supreme Court / High Court reference search where available
- Emergency guidance: top emergency strip clearly advising contacting police (112), cyber fraud (1930), women's helpline (1091), or a qualified advocate
- Location/state selector because laws and police procedures differ across Indian states

AI PROVIDER INTEGRATION:
- Support Groq AI API (allow user to input their Groq API key in an API settings modal or use a default/fallback) for ultra-fast legal Q&A inference
- Lovable AI as secondary/fallback provider

SAFETY & COMPLIANCE:
- Never pretend to be a licensed lawyer
- Never guarantee legal outcomes
- Clearly distinguish legal information from formal legal counsel
- Show source, law/section/article, jurisdiction, and verification notice
- For high-risk criminal/custodial situations, prominently urge consulting a licensed advocate
- Strictly prevent fabricated citations, sections, or judgments

UI / UX:
- Modern Indian legal-tech SaaS design, mobile-first, clean dashboard
- Navigation: Home | Ask AI | Know Your Rights | Constitution | Laws | Legal Procedures | Documents | Case Search | Saved Answers
- Interactive quick query chips, copyable citations, downloadable drafts, and clean typography suitable for reading legal articles.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1078e16f-1cc5-4136-8d0b-adc275c07d72).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
