import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Tag } from 'lucide-react';
import { subscriptionPlans } from '../data/mockData';
import { CTAButton } from '../components/CTAButton';
import { useCart } from '../context/CartContext';

export const SubscriptionDetails: React.FC = () => {
    const { planId } = useParams();
    const { addItem, items } = useCart();
    const plan = subscriptionPlans.find((item) => item.id === planId);

    if (!plan) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-8">
                <section className="pt-24 pb-5 bg-host-gradient border-b border-white/10">
                    <div className="container mx-auto px-6">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            ABONAMENT <span className="text-host-cyan">INEXISTENT</span>
                        </h1>
                        <p className="text-blue-100/90 mt-2 text-sm md:text-base">
                            Abonamentul selectat nu a fost găsit.
                        </p>
                    </div>
                </section>
                <div className="container mx-auto px-6 mt-5">
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-host-cyan text-white font-bold"
                    >
                        <ArrowLeft size={16} />
                        Înapoi la abonamente
                    </Link>
                </div>
            </div>
        );
    }

    const finalPrice = plan.discountPrice ?? plan.price;
    const savings = plan.discountPrice ? plan.price - plan.discountPrice : 0;
    const inCart = items.some((item) => item.id === plan.id);
    const qty = items.find((item) => item.id === plan.id)?.quantity ?? 0;

    const detailByPlanId: Record<string, { description: string; schedule: string[]; image: string }> = {
        plan1: {
            image: 'https://atlantisswim.md/wp-content/uploads/2025/08/1755791387916257-scaled.jpg',
            description:
                'Acest abonament include 4 lecții de înot, desfășurate pe parcursul a 4 săptămâni, în funcție de orarul ales. Lecțiile se desfășoară în grup, iar un antrenament durează 45 de minute.',
            schedule: [
                'Luni & Miercuri: 17:00, 18:00, 19:00',
                'Marți & Joi: 17:00, 18:00, 19:00',
                'Weekend: Sâmbătă & Duminică - 10:00, 11:00, 12:00',
            ],
        },
        plan2: {
            image: 'https://atlantisswim.md/wp-content/uploads/2025/08/1755791394434546-scaled.jpg',
            description:
                'Acest abonament include 8 lecții de înot, desfășurate pe parcursul a 4 săptămâni, în funcție de orarul ales. Lecțiile se desfășoară în grup, iar un antrenament durează 45 de minute!',
            schedule: [
                'Luni & Miercuri: 17:00, 18:00, 19:00',
                'Marți & Joi: 16:00, 17:00, 18:00, 19:00',
                'Weekend: Sâmbătă & Duminică - 10:00, 11:00, 12:00',
            ],
        },
        plan3: {
            image: 'https://atlantisswim.md/wp-content/uploads/2022/11/175560875357502-1536x2048.jpg',
            description:
                'Abonamentul Pro este ideal pentru cei care doresc să obțină rezultate mai rapide. Include 12 antrenamente pe parcursul a 4 săptămâni, cu frecvență de 3 ședințe pe săptămână. Un antrenament durează 45 de minute.',
            schedule: [
                'Luni, Miercuri, Vineri: 17:00, 18:00, 19:00',
                'Marți, Joi, Vineri: 17:00, 18:00, 19:00',
            ],
        },
        plan4: {
            image: 'https://atlantisswim.md/wp-content/uploads/2025/08/175560879720414-1536x2048.jpg',
            description:
                'Acest abonament include 24 de lecții de înot (8 lecții/lună × 3 luni), desfășurate pe parcursul a 12 săptămâni. Este alegerea potrivită pentru cei care doresc un progres constant și stabil, cu o reducere avantajoasă de 10% din prețul deja redus. Înoți mai mult, plătești mai puțin.',
            schedule: [
                'Luni & Miercuri: 17:00, 18:00, 19:00',
                'Marți & Joi: 16:00, 17:00, 18:00, 19:00',
                'Weekend: Sâmbătă & Duminică - 10:00, 11:00, 12:00',
            ],
        },
        plan5: {
            image: 'https://atlantisswim.md/wp-content/uploads/2025/08/1755608799148271-scaled.jpg',
            description:
                'Acest abonament include 36 de lecții de înot (12 lecții/lună × 3 luni), desfășurate pe parcursul a 12 săptămâni. Este alegerea ideală pentru cei care doresc să evolueze rapid și să își perfecționeze tehnica de înot. Beneficiezi de o reducere de 10% din prețul deja redus. Înoți mai mult, plătești mai puțin.',
            schedule: [
                'Luni, Miercuri, Vineri: 17:00, 18:00, 19:00',
                'Marți, Joi, Vineri: 17:00, 18:00, 19:00',
            ],
        },
        plan6: {
            image: 'https://atlantisswim.md/wp-content/uploads/2025/08/175560879055773-scaled.jpg',
            description:
                'Cursul Individual este dedicat celor care preferă antrenamente 1 la 1 cu antrenorul. Include 5 ședințe personalizate pentru o durată de 3 săptămâni, cu un program stabilit de comun acord. Lecțiile sunt adaptate ritmului, nivelului și obiectivelor cursantului.',
            schedule: [
                'Flexibil, în funcție de disponibilitatea antrenorului și a cursantului.',
                'La necesitate, antrenorul poate fi în apă cu copilul pentru o învățare mai sigură și mai rapidă.',
                'Antrenamentele anulate cu o zi înainte pot fi reprogramate.',
                'Antrenamentele anulate în ziua programării nu se recuperează.',
            ],
        },
        plan7: {
            image: 'https://atlantisswim.md/wp-content/uploads/2025/08/1755608863802712-1-scaled.jpg',
            description:
                'Cursul Individual este dedicat celor care preferă antrenamente 1 la 1 cu antrenorul. Include 10 ședințe personalizate pe parcursul a 5 săptămâni, cu un program stabilit de comun acord. Lecțiile sunt adaptate ritmului, nivelului și obiectivelor cursantului. La procurarea a 10 ședințe obții o reducere de 7%.',
            schedule: [
                'Flexibil, în funcție de disponibilitatea antrenorului și a cursantului.',
                'La necesitate, antrenorul poate fi în apă cu copilul pentru o învățare mai sigură și mai rapidă.',
                'Antrenamentele anulate cu o zi înainte pot fi reprogramate.',
                'Antrenamentele anulate în ziua programării nu se recuperează.',
            ],
        },
        plan8: {
            image: 'https://atlantisswim.md/wp-content/uploads/2025/09/542081340_18064308863363900_4440822476891816333_n.jpg',
            description:
                'Chișinău hai la înot. Organizăm transport tur retur din sectorul în care locuiești și antrenamente de grup la bazinul Aquacenter din incinta Arenei Chișinău. Antrenamentul durează 45 de minute! Abonamentul include 8 antrenamente pe perioada de 4 săptămâni și transport tur retur pentru copii de la 6 ani!',
            schedule: [
                'Transport tur-retur inclus din sectorul de domiciliu (Chișinău).',
                'Antrenamente de grup la bazinul Aquacenter, Arena Chișinău.',
            ],
        },
        plan9: {
            image: 'https://atlantisswim.md/wp-content/uploads/2022/11/1755608905796779-scaled.jpg',
            description:
                'Ialoveni hai la înot la Arena Chișinău. Organizăm transport tur retur din orașul Ialoveni și antrenamente de grup la bazin! Antrenamentul durează 45 de minute! Abonamentul include 8 antrenamente pe perioada de 4 săptămâni și transport tur retur pentru copii de la 6 ani!',
            schedule: [
                'Transport tur-retur inclus din orașul Ialoveni.',
                'Antrenamente de grup la bazin (Arena Chișinău).',
            ],
        },
    };

    const fallbackScheduleByCategory: Record<string, string[]> = {
        standard: ['Luni & Miercuri: 17:00, 18:00', 'Marți & Joi: 17:00, 19:00'],
        pro: ['Luni, Miercuri, Vineri: 18:00, 19:00', 'Marți & Joi: 19:00, 20:00'],
        individual: ['Program flexibil: 08:00-12:00', 'Program flexibil: 17:00-21:00'],
        transport: ['Transport inclus + program standard', 'Ore confirmate la înscriere'],
    };

    const detail = detailByPlanId[plan.id] ?? {
        image: 'https://atlantisswim.md/wp-content/uploads/2025/08/1755791387916257-scaled.jpg',
        description: `Acest abonament include ${plan.sessions} ședințe de înot pe durata de ${plan.duration}, cu antrenamente desfășurate în grupuri organizate.`,
        schedule: fallbackScheduleByCategory[plan.category] ?? fallbackScheduleByCategory.standard,
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-8">
            <section className="pt-24 pb-5 bg-host-gradient border-b border-white/10">
                <div className="container mx-auto px-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        DETALII <span className="text-host-cyan">ABONAMENT</span>
                    </h1>
                    <p className="text-blue-100/90 mt-2 text-sm md:text-base">
                        Aici vezi mai multe informații despre abonamentul selectat.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-6 mt-5">
                <div className="mb-4">
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-host-cyan font-bold"
                    >
                        <ArrowLeft size={16} />
                        Înapoi la abonamente
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 md:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                        <div className="w-full max-w-[440px] mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/30">
                            <img
                                src={detail.image}
                                alt={plan.name}
                                className="w-full h-[390px] object-cover"
                            />
                        </div>

                        <div>
                            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-host-cyan">
                                <Tag size={12} />
                                {plan.category}
                            </p>
                            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                {plan.name}
                            </h2>

                            <div className="mt-3 flex items-end gap-3">
                                {plan.discountPrice && (
                                    <span className="text-lg text-gray-400 line-through">{plan.price} MDL</span>
                                )}
                                <span className="text-4xl font-extrabold text-host-cyan">{finalPrice} MDL</span>
                            </div>
                            <CTAButton
                                onClick={() => addItem({
                                    id: plan.id,
                                    name: plan.name,
                                    price: plan.price,
                                    discountPrice: plan.discountPrice ?? undefined,
                                })}
                                style={inCart ? {
                                    borderRadius: '9999px',
                                    background: 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)',
                                    minHeight: '44px',
                                } : undefined}
                                className="mt-4 max-w-xs"
                            >
                                <ShoppingCart size={16} className="mr-2" />
                                <span>{inCart ? `Adăugat în coș (${qty})` : 'ADĂUGĂ ÎN COȘ'}</span>
                            </CTAButton>

                            <p className="mt-5 text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                {detail.description}
                            </p>

                            <div className="mt-4">
                                <p className="text-lg font-bold text-gray-800 dark:text-white">Program disponibil:</p>
                                <ul className="mt-2 space-y-1.5 text-base text-gray-700 dark:text-gray-300 list-disc pl-5">
                                    {detail.schedule.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-4 rounded-xl border border-cyan-100 dark:border-cyan-900 bg-cyan-50/70 dark:bg-cyan-950/20 p-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {savings > 0
                                        ? `Economisești ${savings} MDL față de prețul standard.`
                                        : 'Acest abonament este fără reducere activă în acest moment.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
