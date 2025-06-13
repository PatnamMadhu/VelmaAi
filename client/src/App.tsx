import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DesktopWrapper } from "@/components/DesktopWrapper";
import Home from "@/pages/home";
import SimpleChat from "@/pages/simple-chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SimpleChat} />
      <Route path="/full" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DesktopWrapper>
          <Toaster />
          <Router />
        </DesktopWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
