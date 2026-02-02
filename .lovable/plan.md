
# Auto-Update Existing Shloks (Upsert Behavior)

When adding a shlok with a chapter/verse combination that already exists, the system will automatically update the existing record instead of showing an error.

## Changes Required

| File | Change |
|------|--------|
| `supabase/functions/admin-crud/index.ts` | Add new `upsert` operation that uses Supabase's upsert functionality |
| `src/lib/adminApi.ts` | Update `createShlok` function to use upsert operation instead of create |
| `src/pages/admin/AdminShlokForm.tsx` | Update success message to indicate if shlok was created or updated |

## How It Will Work

```text
User enters Chapter 1, Verse 1 with Sanskrit text
    |
    v
System checks if shlok exists
    |
    +---> Exists: Update the existing record
    |
    +---> New: Create new record
    |
    v
Success message: "Shlok created" or "Shlok updated"
```

## Technical Details

### 1. Edge Function - Add Upsert Operation

Add a new `upsert` operation to the admin-crud edge function that uses Supabase's built-in upsert with `onConflict` parameter:

```typescript
case "upsert": {
  if (!data) {
    return error response;
  }

  const { data: upserted, error } = await supabase
    .from(table)
    .upsert(data, { 
      onConflict: options.conflictColumns || 'id',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (error) throw error;
  result = upserted;
  break;
}
```

### 2. Admin API - Use Upsert for Shloks

Update `createShlok` to use the new upsert operation with the unique constraint columns (chapter_id, verse_number):

```typescript
export async function createShlok(data: Partial<AdminShlok>): Promise<AdminShlok> {
  // Use upsert with conflict on chapter_id + verse_number
  return adminCrud<AdminShlok>('shloks', 'upsert', { 
    data: insertData,
    conflictColumns: 'chapter_id,verse_number'
  });
}
```

### 3. Form - Show Appropriate Message

The form will display:
- "Shlok created successfully" for new records
- "Shlok saved successfully" when updating (covers both create and edit cases)

## Benefits

1. No more duplicate key errors when adding content to existing shloks
2. Seamless workflow: add Sanskrit text first, then come back later to add translations
3. The verse number becomes a natural identifier within each chapter
