
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Fetch all categories
export const fetchAllCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error("Failed to load categories");
    return [];
  }
};

// Fetch a single category by ID
export const fetchCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching category:', error);
    toast.error("Failed to load category");
    return null;
  }
};

// Create a new category
export const createCategory = async (
  category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        description: category.description,
        image_url: category.image_url
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    toast.success(`Category "${category.name}" created successfully`);
    return data?.id;
  } catch (error) {
    console.error('Error creating category:', error);
    toast.error("Failed to create category");
    return null;
  }
};

// Update a category
export const updateCategory = async (
  id: string,
  category: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success("Category updated successfully");
    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    toast.error("Failed to update category");
    return false;
  }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success("Category deleted successfully");
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    toast.error("Failed to delete category");
    return false;
  }
};

// Add anime to category
export const addAnimeToCategory = async (
  animeId: string, 
  categoryId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('anime_categories')
      .insert({
        anime_id: animeId,
        category_id: categoryId
      });
    
    if (error) throw error;
    
    toast.success("Anime added to category");
    return true;
  } catch (error) {
    console.error('Error adding anime to category:', error);
    toast.error("Failed to add anime to category");
    return false;
  }
};

// Remove anime from category
export const removeAnimeFromCategory = async (
  animeId: string, 
  categoryId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('anime_categories')
      .delete()
      .match({
        anime_id: animeId,
        category_id: categoryId
      });
    
    if (error) throw error;
    
    toast.success("Anime removed from category");
    return true;
  } catch (error) {
    console.error('Error removing anime from category:', error);
    toast.error("Failed to remove anime from category");
    return false;
  }
};

// Get all anime in a category
export const getAnimeByCategory = async (categoryId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('anime_categories')
      .select(`
        anime_id,
        anime (
          id, title, image_url, description, rating, release_year, type, status
        )
      `)
      .eq('category_id', categoryId);
    
    if (error) throw error;
    
    // Transform the data to a more usable format
    return (data?.map(item => item.anime) || []);
  } catch (error) {
    console.error('Error fetching anime by category:', error);
    toast.error("Failed to load anime for this category");
    return [];
  }
};

// Get all categories for an anime
export const getCategoriesForAnime = async (animeId: string): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('anime_categories')
      .select(`
        category_id,
        categories (*)
      `)
      .eq('anime_id', animeId);
    
    if (error) throw error;
    
    // Transform the data to a more usable format
    return (data?.map(item => item.categories) || []);
  } catch (error) {
    console.error('Error fetching categories for anime:', error);
    toast.error("Failed to load categories for this anime");
    return [];
  }
};
