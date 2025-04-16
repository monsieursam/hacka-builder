// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Prize, Track } from '@/types';
import { createPrize, updatePrize } from '@/actions/prizes';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Custom Combobox component
function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyText = "No options found"
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search...`} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const formSchema = z.object({
  name: z.string().min(1, 'Prize name is required'),
  description: z.string().optional(),
  isMonetary: z.boolean().optional().default(true),
  value: z.coerce.number().optional(),
  currency: z.string().optional(),
  prizeType: z.string().optional().default('monetary'),
  rank: z.coerce.number().optional(),
  hackathonId: z.string().uuid('Invalid hackathon ID'),
  trackId: z.string().uuid('Invalid track ID').optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface PrizeFormProps {
  initialData?: Prize | null;
  tracks?: Track[];
  onSuccess?: () => void;
}

const prizeTypes = [
  { label: 'Monetary', value: 'monetary' },
  { label: 'Trip', value: 'trip' },
  { label: 'Subscription', value: 'subscription' },
  { label: 'Product', value: 'product' },
  { label: 'Gift Card', value: 'giftcard' },
  { label: 'Other', value: 'other' },
];

export function PrizeForm({ initialData, tracks = [], onSuccess }: PrizeFormProps) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      isMonetary: initialData?.value ? true : false,
      prizeType: initialData?.value ? 'monetary' : 'other',
      value: initialData?.value || undefined,
      currency: initialData?.currency || 'USD',
      rank: initialData?.rank || undefined,
      hackathonId: params.id,
      trackId: initialData?.trackId || null,
    },
  });

  const prizeType = form.watch('prizeType');
  const isMonetary = prizeType === 'monetary';

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Prepare data for submission
      const submissionData = {
        name: values.name,
        description: values.description,
        value: isMonetary ? values.value : undefined,
        currency: isMonetary ? values.currency : undefined,
        rank: values.rank,
        hackathonId: values.hackathonId,
        trackId: values.trackId,
      };
      
      // If description is empty, add the prize type as description
      if (!submissionData.description && values.prizeType !== 'monetary') {
        submissionData.description = `${values.prizeType?.charAt(0).toUpperCase()}${values.prizeType?.slice(1) || ''} prize`;
      }

      if (initialData) {
        // Update existing prize
        const result = await updatePrize(initialData.id, submissionData);
        if (result.success) {
          toast.success('Prize updated');
          router.refresh();
          onSuccess?.();
        } else {
          toast.error(result.error || 'Failed to update prize. Please try again.');
        }
      } else {
        // Create new prize
        const result = await createPrize(submissionData);
        if (result.success) {
          toast.success('Prize created');
          form.reset();
          router.refresh();
          onSuccess?.();
        } else {
          toast.error(result.error || 'Failed to create prize. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting prize form:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prize Name*</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 1st Place Prize" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="prizeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prize Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select prize type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {prizeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the type of prize you're offering
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isMonetary && (
          <>
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="USD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={isMonetary 
                    ? "Describe the prize..." 
                    : "e.g., Free 1-year subscription to our product, Trip to San Francisco, etc."} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {!isMonetary && "Provide details about the non-monetary prize"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rank</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1 for 1st place, 2 for 2nd, etc." {...field} />
              </FormControl>
              <FormDescription>
                Used for sorting prizes by ranking (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {tracks.length > 0 && (
          <FormField
            control={form.control}
            name="trackId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Track (Optional)</FormLabel>
                <FormControl>
                  <Combobox
                    options={tracks.map(track => ({
                      label: track.name,
                      value: track.id,
                    }))}
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Select a track (optional)"
                    emptyText="No tracks found"
                  />
                </FormControl>
                <FormDescription>
                  Associate this prize with a specific track
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Prize' : 'Create Prize'}
        </Button>
      </form>
    </Form>
  );
} 