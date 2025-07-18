import { Await, createFileRoute } from '@tanstack/react-router';
import type { BaseSyntheticEvent } from 'react';
import { useAppContext } from '../-context/test';

export const Route = createFileRoute('/_public/')({
  loader: () => ({
    date: new Date(),
    deferred: new Promise<{ date: Date }>((r) =>
      setTimeout(() => r({ date: new Date() }), 1000),
    ),
  }),
  component: IndexComponent,
})

function IndexComponent() {
  const data = Route.useLoaderData()
  const [value, setValue] = useAppContext();

  const onSubmit = (evt:BaseSyntheticEvent) => {
    evt.preventDefault();
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    const formData = new FormData(evt?.currentTarget);
    const data = Object.fromEntries(formData);
    setValue(data.value as string);
  }
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <p>Data: {data.date.getDate()}</p>
      <Await promise={data.deferred} fallback="Loading...">
        {(data) => <p>Deferred: {new Date(data.date).getDate()}</p>}
      </Await>
      <div>값: {value}</div>
      <form onSubmit={onSubmit}>
        <input name='value'/>
        <button>셋업</button>
      </form>
    </div>
  )
}
