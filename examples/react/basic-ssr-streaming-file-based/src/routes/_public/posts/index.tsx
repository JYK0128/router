import { createFileRoute } from '@tanstack/react-router';
import { useAppContext } from '../../-context/test';

export const Route = createFileRoute('/_public/posts/')({
  component: PostsIndexComponent,
  wrapInSuspense: true,
  head: () => ({
    "meta": [{"title": '안녕'}]
  }),
  errorComponent: ({ error }) => {
    return (
      <div className="text-red-500">Failed to load post: {error.message}</div>
    )
  },
})

function PostsIndexComponent() {
  const [value, setValue] = useAppContext();

  return (
    <div>
      <div>{value}</div>
      <div>Select a post.</div>
    </div>
  )
}
