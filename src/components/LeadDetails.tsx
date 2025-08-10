import React, { useState } from 'react';
import { ArrowLeft, Save, Calendar, User, Phone, Mail, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
interface Lead {
  id: string;
  customerName: string;
  customerId: string;
  mobileNumber: string;
  createdDate: string;
  reportGenerated?: boolean;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  panNumber?: string;
  dateOfBirth?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  loanAmount: string;
  productType: 'Home Loan' | 'LAP' | 'Balance Transfer';
  freshsalesId?: string;
  whatsappNumber?: string;
  alternateNumber?: string;
}
interface LeadDetailsProps {
  lead?: Lead;
  onBack: () => void;
  onSave: (leadData: any) => void;
  isNewLead?: boolean;
}
const LeadDetails: React.FC<LeadDetailsProps> = ({
  lead,
  onBack,
  onSave,
  isNewLead = false
}) => {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    firstName: lead?.firstName || '',
    middleName: lead?.middleName || '',
    lastName: lead?.lastName || '',
    gender: lead?.gender || '',
    panNumber: lead?.panNumber || '',
    dateOfBirth: lead?.dateOfBirth ? new Date(lead.dateOfBirth) : undefined,
    mobileNumber: lead?.mobileNumber || '',
    whatsappNumber: lead?.whatsappNumber || '',
    alternateNumber: lead?.alternateNumber || '',
    email: lead?.email || '',
    addressLine1: lead?.addressLine1 || '',
    addressLine2: lead?.addressLine2 || '',
    city: lead?.city || '',
    state: lead?.state || '',
    pincode: lead?.pincode || '',
    loanAmount: lead?.loanAmount || '',
    productType: lead?.productType || '',
    freshsalesId: lead?.freshsalesId || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  // Function to fetch location data based on pincode
  const fetchLocationByPincode = async (pincode: string) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return;
    setIsLoadingPincode(true);
    try {
      // Using India Post API for pincode lookup
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        handleInputChange('city', postOffice.District);
        handleInputChange('state', postOffice.State);
      } else {
        // Clear fields if no data found
        handleInputChange('city', '');
        handleInputChange('state', '');
      }
    } catch (error) {
      console.error('Error fetching pincode data:', error);
      // Silently fail - user can still enter manually
    } finally {
      setIsLoadingPincode(false);
    }
  };
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-populate district and state when pincode changes
    if (field === 'pincode' && value.length === 6) {
      fetchLocationByPincode(value);
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (formData.panNumber && !panRegex.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }

    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (formData.mobileNumber && !mobileRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive"
      });
      return;
    }
    try {
      // Simulate API call
      const submitData = {
        ...formData,
        panNumber: formData.panNumber.toUpperCase(),
        dateOfBirth: formData.dateOfBirth?.toISOString().split('T')[0]
      };
      console.log('Submitting lead data:', submitData);

      // In real implementation, make API call here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      onSave(submitData);
      toast({
        title: isNewLead ? "Credit Inquiry Submitted" : "Lead Updated",
        description: isNewLead ? "Credit inquiry has been submitted successfully. You will be redirected to the dashboard." : "Lead details have been updated successfully."
      });

      // Simulate navigation back to dashboard after successful submission
      setTimeout(() => onBack(), 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lead details. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img src="/nivasa-logo.png" alt="Nivasa Finance" className="h-12 w-auto" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-base font-medium">First Name *</Label>
                <Input id="firstName" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} className={cn("text-base h-12", errors.firstName && "border-destructive")} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-3">
                <Label htmlFor="middleName" className="text-base font-medium">Middle Name</Label>
                <Input id="middleName" value={formData.middleName} onChange={e => handleInputChange('middleName', e.target.value)} className="text-base h-12" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-base font-medium">Last Name *</Label>
                <Input id="lastName" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} className={cn("text-base h-12", errors.lastName && "border-destructive")} />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="dateOfBirth" className="text-base font-medium">Date of Birth *</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Day</Label>
                      <Select value={formData.dateOfBirth ? formData.dateOfBirth.getDate().toString() : ""} onValueChange={day => {
                      const currentDate = formData.dateOfBirth || new Date(1990, 0, 1);
                      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(day));
                      handleInputChange('dateOfBirth', newDate);
                    }}>
                        <SelectTrigger className="text-base h-12">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          {Array.from({
                          length: 31
                        }, (_, i) => <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">Month</Label>
                      <Select value={formData.dateOfBirth ? formData.dateOfBirth.getMonth().toString() : ""} onValueChange={month => {
                      const currentDate = formData.dateOfBirth || new Date(1990, 0, 1);
                      const newDate = new Date(currentDate.getFullYear(), parseInt(month), currentDate.getDate());
                      handleInputChange('dateOfBirth', newDate);
                    }}>
                        <SelectTrigger className="text-base h-12">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => <SelectItem key={index} value={index.toString()}>
                              {month}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">Year</Label>
                      <Select value={formData.dateOfBirth ? formData.dateOfBirth.getFullYear().toString() : ""} onValueChange={year => {
                      const currentDate = formData.dateOfBirth || new Date(1990, 0, 1);
                      const newDate = new Date(parseInt(year), currentDate.getMonth(), currentDate.getDate());
                      handleInputChange('dateOfBirth', newDate);
                    }}>
                        <SelectTrigger className="text-base h-12">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50 max-h-60">
                          {Array.from({
                          length: new Date().getFullYear() - 1920 + 1
                        }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>;
                        })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {formData.dateOfBirth && <div className="p-3 bg-muted rounded-md border">
                      <p className="text-base font-medium">
                        Selected Date: {format(formData.dateOfBirth, "d MMMM yyyy")}
                      </p>
                    </div>}
                </div>
                {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="mobileNumber" className="text-base font-medium">Primary Number *</Label>
                <Input id="mobileNumber" value={formData.mobileNumber} onChange={e => handleInputChange('mobileNumber', e.target.value)} placeholder="10-digit mobile number" className={cn("text-base h-12", errors.mobileNumber && "border-destructive")} />
                {errors.mobileNumber && <p className="text-sm text-destructive">{errors.mobileNumber}</p>}
              </div>
              <div className="space-y-3">
                <Label htmlFor="whatsappNumber" className="text-base font-medium">WhatsApp Number</Label>
                <Input id="whatsappNumber" value={formData.whatsappNumber} onChange={e => handleInputChange('whatsappNumber', e.target.value)} placeholder="10-digit WhatsApp number" className="text-base h-12" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="alternateNumber" className="text-base font-medium">Alternate Number</Label>
                <Input id="alternateNumber" value={formData.alternateNumber} onChange={e => handleInputChange('alternateNumber', e.target.value)} placeholder="10-digit alternate number" className="text-base h-12" />
              </div>
            </div>
            
            
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="addressLine1" className="text-base font-medium">Address Line 1 *</Label>
              <Input id="addressLine1" value={formData.addressLine1} onChange={e => handleInputChange('addressLine1', e.target.value)} className={cn("text-base h-12", errors.addressLine1 && "border-destructive")} />
              {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1}</p>}
            </div>
            
            
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="city" className="text-base font-medium">District</Label>
                <Input id="city" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className="text-base h-12" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="state" className="text-base font-medium">State</Label>
                <Input id="state" value={formData.state} onChange={e => handleInputChange('state', e.target.value)} className="text-base h-12" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="pincode" className="text-base font-medium">Pincode *</Label>
                <div className="relative">
                  <Input id="pincode" value={formData.pincode} onChange={e => handleInputChange('pincode', e.target.value)} className={cn("text-base h-12", errors.pincode && "border-destructive")} placeholder="Enter 6-digit pincode" maxLength={6} />
                  {isLoadingPincode && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
                </div>
                {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="panNumber" className="text-base font-medium">PAN Number *</Label>
                <Input id="panNumber" value={formData.panNumber} onChange={e => handleInputChange('panNumber', e.target.value.toUpperCase())} placeholder="ABCDE1234F" className={cn("text-base h-12", errors.panNumber && "border-destructive")} />
                {errors.panNumber && <p className="text-sm text-destructive">{errors.panNumber}</p>}
              </div>
              
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack} className="text-base h-12 px-6">
            Cancel
          </Button>
          <Button type="submit" className="bg-primary-blue hover:bg-primary-blue/90 text-base h-12 px-6">
            <Save className="mr-2 h-5 w-5" />
            {isNewLead ? 'Submit Inquiry' : 'Save Lead'}
          </Button>
        </div>
      </form>
    </div>;
};
export default LeadDetails;