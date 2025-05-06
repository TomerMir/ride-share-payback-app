
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SecretRedirect = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-lg">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            This application requires a secret URL to access.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please contact the administrator if you need access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecretRedirect;
