import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import Editor from "./Editor";

const Playground = (props: { bundledVersionName: string }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Editor bundledVersionName={props.bundledVersionName} />
    </QueryClientProvider>
  );
};

export default Playground;
