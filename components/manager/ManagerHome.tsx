// components/manager/ManagerHome.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import type { Courier, PaymentMethod, Zone } from '@/lib/types';
import { createOrder } from '@/lib/api';
import { useMemo } from 'react';
import { notifyError, notifySuccess } from '@/lib/notify';

const PAYMENT_METHODS: PaymentMethod[] = [
  'cash',
  'wave',
  'orange_money',
  'mtn_money',
  'moov_money',
];

type FormValues = {
  clientCode: string;
  zone: Zone;
  roomNumber: string;
  phone: string;

  customerName?: string;
  description?: string;
  price?: string;                        // saisi en string -> converti en nombre
  paymentMethod?: PaymentMethod | null;  // << null pour “non choisi” (évite la comparaison avec "")
  notes?: string;
};

export default function ManagerHome({ courier, onFlash }: { courier: Courier | null; onFlash?: (msg: string) => void }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      clientCode: '',
      zone: 'sud',
      roomNumber: '',
      phone: '',
      customerName: '',
      description: '',
      price: '',
      paymentMethod: null,               // << null par défaut
      notes: '',
    },
  });

  const submittingDisabled = useMemo(() => !isValid || isSubmitting, [isValid, isSubmitting]);

  const onSubmit = handleSubmit(async (values) => {
    const priceNumber =
      values.price && values.price.trim() !== ''
        ? Math.max(0, parseInt(values.price, 10))
        : undefined;

    try {
      const res = await createOrder({
        clientCode: values.clientCode.trim(),
        zone: values.zone,
        roomNumber: values.roomNumber.trim(),
        phone: values.phone.trim(),
      });

      reset({
        clientCode: '',
        zone: 'sud',
        roomNumber: '',
        phone: '',
        customerName: '', // conservé dans le formulaire pour futur usage
        description: '',
        price: '',
        paymentMethod: null,
        notes: '',
      });

      const ok = `Commande créée ✅ — ID ${res.id}`;
      onFlash?.(ok);
      notifySuccess(ok);
    } catch (e: any) {
      const err = `Erreur: ${e.message}`;
      onFlash?.(err);
      notifyError(err);
    }
  });

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <div className="flex items-center gap-2 text-sm font-medium">
      {children}
      {required && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
          exigé
        </span>
      )}
    </div>
  );

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-extrabold">Créer une commande</h1>

      <form onSubmit={onSubmit} className="space-y-6">

        {/* _____LES INPUTS REQUIS DU FORMULAIRE_____ */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label required>Code client</Label>
            <Controller
              name="clientCode"
              control={control}
              rules={{ required: 'Requis' }}
              render={({ field }) => (
                <input
                  {...field}
                  autoComplete="off"
                  placeholder="ex: abc123"
                  className={`border border-gray-400 rounded p-3 ${errors.clientCode ? 'border-rose-500' : ''}`}
                />
              )}
            />
            {errors.clientCode && (
              <span className="text-xs text-rose-600">{errors.clientCode.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label required>Zone</Label>
            <Controller
              name="zone"
              control={control}
              rules={{ required: 'Requis' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`border border-gray-400 rounded p-3 ${errors.zone ? 'border-rose-500' : ''}`}
                >
                  <option value="sud">Sud</option>
                  <option value="centre">Centre</option>
                </select>
              )}
            />
            {errors.zone && (
              <span className="text-xs text-rose-600">{errors.zone.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label required>N° chambre</Label>
            <Controller
              name="roomNumber"
              control={control}
              rules={{ required: 'Requis' }}
              render={({ field }) => (
                <input
                  {...field}
                  autoComplete="off"
                  placeholder="ex: K51"
                  className={`border border-gray-400 rounded p-3 ${errors.roomNumber ? 'border-rose-500' : ''}`}
                />
              )}
            />
            {errors.roomNumber && (
              <span className="text-xs text-rose-600">{errors.roomNumber.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <Label required>N° téléphone</Label>
            <Controller
              name="phone"
              control={control}
              rules={{
                required: 'Requis',
                validate: (v) =>
                  v && v.replace(/\D/g, '').length >= 8 ? true : 'Numéro invalide',
              }}
              render={({ field }) => (
                <input
                  {...field}
                  autoComplete="off"
                  inputMode="tel"
                  placeholder="ex: 070000000"
                  className={`border border-gray-400 rounded p-3 ${errors.phone ? 'border-rose-500' : ''}`}
                />
              )}
            />
            {errors.phone && (
              <span className="text-xs text-rose-600">{errors.phone.message}</span>
            )}
          </div>
        </div>

        {/* _____LES INFOS REQUIS DU FORMULAIRE_____ */}
        
        <details className="border rounded p-3">
          <summary className="font-semibold cursor-pointer">Infos supplémentaires</summary>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Nom du client</div>
              <Controller
                name="customerName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    autoComplete="off"
                    placeholder="Nom du client"
                    className="border rounded p-2"
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Prix (FCFA)</div>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    autoComplete="off"
                    inputMode="numeric"
                    placeholder="Prix (FCFA)"
                    onChange={(e) => field.onChange(e.target.value.replace(/[^\d]/g, ''))}
                    className="border rounded p-2"
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Moyen de paiement</div>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value ?? ''}                 // << map null -> ''
                    onChange={(e) => field.onChange(e.target.value || null)} // '' -> null
                    className="border rounded p-2"
                  >
                    <option value="">—</option>
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-3">
              <div className="text-sm font-medium">Description du plat</div>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    autoComplete="off"
                    placeholder="Description du plat"
                    className="border rounded p-2"
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-3">
              <div className="text-sm font-medium">Notes</div>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="Notes (ex: 1 billet de 2000 FCFA)"
                    className="border rounded p-2 w-full"
                  />
                )}
              />
            </div>
          </div>
        </details>

        {/* _____LE BOUTON DU FORMULAIRE_____*/}
        <button
          type="submit"
          disabled={submittingDisabled}
          className="rounded bg-black font-body text-white w-full py-3 disabled:opacity-40 "
        >
          {isSubmitting ? 'En création…' : 'Créer la commande'}
        </button>

      </form>

    </section>
  );
}
