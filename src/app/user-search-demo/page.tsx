import { UserSearch } from '@/components/UserSearch';
import { User } from '@/db/schema';
import { Card } from '@/components/ui/card';

export default function UserSearchDemo() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">User Search Demo</h1>
      <p className="text-gray-600">
        Search for users by name or email using the server action.
      </p>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Search Users</h2>
        <UserSearch 
          onSelectUser={(user: User) => {
            console.log('Selected user:', user);
            // You can use the selected user data here
          }}
        />
      </Card>
    </div>
  );
} 