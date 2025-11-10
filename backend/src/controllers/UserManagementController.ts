// UserManagementController.ts - User management for farmers and buyers
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class UserManagementController {
  // Get all farmers
  static async getFarmers(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to frontend format
      const farmers = data.map(farmer => ({
        id: farmer.farmer_id,
        name: farmer.full_name,
        email: farmer.email,
        type: 'farmer',
        status: farmer.is_verified ? 'verified' : (farmer.is_active ? 'pending' : 'rejected'),
        association: farmer.association_name,
        municipality: farmer.municipality,
        contactNumber: farmer.contact_number,
        createdAt: farmer.created_at,
      }));

      res.status(200).json(farmers);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      res.status(500).json({ error: 'Failed to fetch farmers' });
    }
  }

  // Get single farmer
  static async getFarmer(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('farmer_id', id)
        .single();

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching farmer:', error);
      res.status(500).json({ error: 'Failed to fetch farmer' });
    }
  }

  // Get all buyers
  static async getBuyers(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .order('created_at', { ascending: false});

      if (error) throw error;

      // Map to frontend format
      const buyers = data.map(buyer => ({
        id: buyer.buyer_id,
        name: buyer.owner_name,
        email: buyer.email,
        type: 'buyer',
        status: buyer.is_verified ? 'verified' : (buyer.is_active ? 'pending' : 'rejected'),
        businessName: buyer.business_name,
        contactNumber: buyer.contact_number,
        createdAt: buyer.created_at,
      }));

      res.status(200).json(buyers);
    } catch (error) {
      console.error('Error fetching buyers:', error);
      res.status(500).json({ error: 'Failed to fetch buyers' });
    }
  }

  // Get single buyer
  static async getBuyer(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('buyer_id', id)
        .single();

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching buyer:', error);
      res.status(500).json({ error: 'Failed to fetch buyer' });
    }
  }

  // Verify farmer
  static async verifyFarmer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const officerId = req.user?.userId; // Get officer who is verifying

      const { data, error } = await supabase
        .from('farmers')
        .update({
          is_verified: true,
          is_active: true,
          verification_status: 'verified',
          verified_by: officerId,
          verified_at: new Date().toISOString(),
          rejection_reason: null, // Clear any previous rejection reason
          updated_at: new Date().toISOString(),
        })
        .eq('farmer_id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ 
        message: 'Farmer verified successfully. They can now login to the system.', 
        farmer: data 
      });
    } catch (error) {
      console.error('Error verifying farmer:', error);
      res.status(500).json({ error: 'Failed to verify farmer' });
    }
  }

  // Reject farmer
  static async rejectFarmer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body; // Get rejection reason from request body
      const officerId = req.user?.userId; // Get officer who is rejecting

      if (!reason || reason.trim() === '') {
        res.status(400).json({ error: 'Rejection reason is required' });
        return;
      }

      const { data, error } = await supabase
        .from('farmers')
        .update({
          is_verified: false,
          is_active: false,
          verification_status: 'rejected',
          verified_by: officerId,
          verified_at: new Date().toISOString(),
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('farmer_id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ 
        message: 'Farmer application rejected. They will be notified of the reason.', 
        farmer: data 
      });
    } catch (error) {
      console.error('Error rejecting farmer:', error);
      res.status(500).json({ error: 'Failed to reject farmer' });
    }
  }

  // Update farmer
  static async updateFarmer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data, error } = await supabase
        .from('farmers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('farmer_id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ message: 'Farmer updated successfully', farmer: data });
    } catch (error) {
      console.error('Error updating farmer:', error);
      res.status(500).json({ error: 'Failed to update farmer' });
    }
  }

  // Delete farmer
  static async deleteFarmer(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('farmer_id', id);

      if (error) throw error;

      res.status(200).json({ message: 'Farmer deleted successfully' });
    } catch (error) {
      console.error('Error deleting farmer:', error);
      res.status(500).json({ error: 'Failed to delete farmer' });
    }
  }

  // Verify buyer
  static async verifyBuyer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const officerId = req.user?.userId; // Get officer who is verifying

      const { data, error } = await supabase
        .from('buyers')
        .update({
          is_verified: true,
          is_active: true,
          verification_status: 'verified',
          verified_by: officerId,
          verified_at: new Date().toISOString(),
          rejection_reason: null, // Clear any previous rejection reason
          updated_at: new Date().toISOString(),
        })
        .eq('buyer_id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ 
        message: 'Buyer verified successfully. They can now login to the system.', 
        buyer: data 
      });
    } catch (error) {
      console.error('Error verifying buyer:', error);
      res.status(500).json({ error: 'Failed to verify buyer' });
    }
  }

  // Reject buyer
  static async rejectBuyer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body; // Get rejection reason from request body
      const officerId = req.user?.userId; // Get officer who is rejecting

      if (!reason || reason.trim() === '') {
        res.status(400).json({ error: 'Rejection reason is required' });
        return;
      }

      const { data, error } = await supabase
        .from('buyers')
        .update({
          is_verified: false,
          is_active: false,
          verification_status: 'rejected',
          verified_by: officerId,
          verified_at: new Date().toISOString(),
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('buyer_id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ 
        message: 'Buyer application rejected. They will be notified of the reason.', 
        buyer: data 
      });
    } catch (error) {
      console.error('Error rejecting buyer:', error);
      res.status(500).json({ error: 'Failed to reject buyer' });
    }
  }

  // Update buyer
  static async updateBuyer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data, error } = await supabase
        .from('buyers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('buyer_id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ message: 'Buyer updated successfully', buyer: data });
    } catch (error) {
      console.error('Error updating buyer:', error);
      res.status(500).json({ error: 'Failed to update buyer' });
    }
  }

  // Delete buyer
  static async deleteBuyer(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('buyers')
        .delete()
        .eq('buyer_id', id);

      if (error) throw error;

      res.status(200).json({ message: 'Buyer deleted successfully' });
    } catch (error) {
      console.error('Error deleting buyer:', error);
      res.status(500).json({ error: 'Failed to delete buyer' });
    }
  }

  // =====================================================
  // OFFICER MANAGEMENT (Self-registered officers only)
  // =====================================================

  // Get all officers (only self-registered with profile_completed = true)
  static async getOfficers(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('organization')
        .select('*')
        .eq('profile_completed', true) // Only self-registered officers
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to frontend format
      const officers = data.map(officer => ({
        id: officer.officer_id,
        name: officer.full_name,
        email: officer.email,
        type: 'officer',
        status: officer.verification_status || (officer.is_verified ? 'verified' : 'pending'),
        officeName: officer.office_name,
        assignedMunicipality: officer.assigned_municipality,
        assignedBarangay: officer.assigned_barangay,
        position: officer.position,
        contactNumber: officer.contact_number,
        createdAt: officer.created_at,
      }));

      res.status(200).json(officers);
    } catch (error) {
      console.error('Error fetching officers:', error);
      res.status(500).json({ error: 'Failed to fetch officers' });
    }
  }

  // Get single officer
  static async getOfficer(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('organization')
        .select('*')
        .eq('officer_id', id)
        .single();

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching officer:', error);
      res.status(500).json({ error: 'Failed to fetch officer' });
    }
  }

  // Update officer
  static async updateOfficer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data, error } = await supabase
        .from('organization')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('officer_id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error('Error updating officer:', error);
      res.status(500).json({ error: 'Failed to update officer' });
    }
  }

  // Verify officer
  static async verifyOfficer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const verifier = (req as any).user;

      const { data, error } = await supabase
        .from('organization')
        .update({
          is_verified: true,
          verification_status: 'verified',
          verified_by: verifier.userId,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('officer_id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ message: 'Officer verified successfully', data });
    } catch (error) {
      console.error('Error verifying officer:', error);
      res.status(500).json({ error: 'Failed to verify officer' });
    }
  }

  // Reject officer
  static async rejectOfficer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const verifier = (req as any).user;

      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const { data, error } = await supabase
        .from('organization')
        .update({
          is_verified: false,
          verification_status: 'rejected',
          rejection_reason: reason,
          verified_by: verifier.userId,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('officer_id', id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ message: 'Officer rejected successfully', data });
    } catch (error) {
      console.error('Error rejecting officer:', error);
      res.status(500).json({ error: 'Failed to reject officer' });
    }
  }

  // Delete officer
  static async deleteOfficer(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('organization')
        .delete()
        .eq('officer_id', id);

      if (error) throw error;

      res.status(200).json({ message: 'Officer deleted successfully' });
    } catch (error) {
      console.error('Error deleting officer:', error);
      res.status(500).json({ error: 'Failed to delete officer' });
    }
  }
}
