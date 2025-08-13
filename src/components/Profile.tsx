
import React from 'react';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from 'next-auth/react';


const Profile = () => {
  const { data: session } = useSession();


  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 p-6 mx-auto max-w-4xl">
        <Button 
          variant="outline" 
          className="mb-6"
        >
          Back to Dashboard
        </Button>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>View and manage your profile information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl">
                  {session?.user?.name || 'N'}
                </AvatarFallback>
              </Avatar>
              <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                {session?.user?.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                <p className="text-lg font-semibold">{session?.user?.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="text-lg font-semibold">{session?.user?.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                <p className="text-lg font-semibold">{session?.user?.role === 'admin' ? 'Administrator' : 'Standard User'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
                <p className="text-lg font-semibold">May 15, 2025</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>Edit Profile</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;