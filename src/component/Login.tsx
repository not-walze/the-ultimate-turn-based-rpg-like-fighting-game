import { useStore } from '../helpers/store';
import Input from '../form/Input';
import { FormEvent, useEffect } from 'react';
import Button from '../form/Button';
import coc from 'js-cookie';

const submit =
  (set: (s: string) => void) =>
  (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const party = formData.get('username') as string;
    if (!party) return;

    set(party);
  };

export default () => {
  const { set } = useStore();

  const handleSubmit = (owner: string) => {
    coc.set('owner', owner, { expires: 0.004 });

    set({ owner });
  };

  useEffect(() => {
    const owner = coc.get('owner');

    if (owner) handleSubmit(owner);
  }, []);

  return (
    <form
      className="rounded-lg space-y-6"
      onSubmit={submit(handleSubmit)}
    >
      <h3 className="text-lg font-bold text-center leading-3 text-gray-900">
        Login
      </h3>

      <Input
        autoFocus
        label="Username"
        placeholder="your username"
      />

      <Button>Sign in</Button>
    </form>
  );
};
