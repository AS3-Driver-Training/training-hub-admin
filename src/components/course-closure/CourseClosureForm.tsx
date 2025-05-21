
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseInfo } from "./CourseInfo";
import { VehicleList } from "./VehicleList";
import { CourseLayout } from "./CourseLayout";
import { CourseClosureData } from "@/types/programs";
import { supabase } from "@/integrations/supabase/client";
import { toast, warning, error, success } from "@/utils/toast";

interface CourseClosureFormProps {
  courseInstanceId: number;
}

export function CourseClosureForm({ courseInstanceId }: CourseClosureFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);
  const [closureData, setClosureData] = useState<CourseClosureData>({
    course_info: {
      units: "MPH",
      country: "USA",
      program: "",
      date: new Date().toISOString().split('T')[0],
      client: ""
    },
    vehicles: [
      {
        car: 1,
        make: "",
        model: "",
        latAcc: 0.8
      }
    ],
    course_layout: {
      final_exercise: {
        ideal_time_sec: 60,
        cone_penalty_sec: 3,
        door_penalty_sec: 5,
        slalom: {
          chord: 100,
          mo: 15
        },
        lane_change: {
          chord: 120,
          mo: 20
        },
        reverse_time: 0
      },
      slalom: {
        chord: 100,
        mo: 15
      },
      lane_change: {
        chord: 120,
        mo: 20
      }
    }
  });

  // Fetch course data when the component mounts
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const { data, error: courseError } = await supabase
          .from('course_instances')
          .select(`
            id,
            start_date,
            end_date,
            programs(name, id),
            venues(name),
            host_client_id,
            clients(name)
          `)
          .eq('id', courseInstanceId)
          .single();

        if (courseError) throw courseError;
        
        setCourseData(data);
        
        // Pre-populate with course data
        if (data) {
          setClosureData(prev => ({
            ...prev,
            course_info: {
              ...prev.course_info,
              program: data.programs?.name || "",
              date: new Date(data.start_date).toISOString().split('T')[0],
              client: data.clients?.name || ""
            }
          }));
        }

        // Check if closure already exists
        const { data: closureExists, error: closureError } = await supabase
          .from('course_closures')
          .select('*')
          .eq('course_instance_id', courseInstanceId)
          .maybeSingle();

        if (closureError) throw closureError;
        
        if (closureExists) {
          // Load existing closure data
          warning("This course already has closure data. Modifications will update the existing record.");
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
        error("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseInstanceId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Check if closure already exists
      const { data: existing, error: checkError } = await supabase
        .from('course_closures')
        .select('id')
        .eq('course_instance_id', courseInstanceId)
        .maybeSingle();

      if (checkError) throw checkError;

      let result;
      
      if (existing) {
        // Update existing record
        result = await supabase
          .from('course_closures')
          .update({
            closed_by: (await supabase.auth.getUser()).data.user?.id,
            status: 'completed',
            units: closureData.course_info.units,
            country: closureData.course_info.country,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select();
      } else {
        // Create new record
        result = await supabase
          .from('course_closures')
          .insert({
            course_instance_id: courseInstanceId,
            closed_by: (await supabase.auth.getUser()).data.user?.id,
            status: 'completed',
            units: closureData.course_info.units,
            country: closureData.course_info.country
          })
          .select();
      }

      if (result.error) throw result.error;
      
      success("Course closure data saved successfully");
      navigate(`/events/${courseInstanceId}`);
    } catch (err) {
      console.error("Error saving course closure:", err);
      error("Failed to save course closure data");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseInfoChange = (info: Partial<CourseClosureData['course_info']>) => {
    setClosureData(prev => ({
      ...prev,
      course_info: {
        ...prev.course_info,
        ...info
      }
    }));
  };

  const handleVehiclesChange = (vehicles: CourseClosureData['vehicles']) => {
    setClosureData(prev => ({
      ...prev,
      vehicles
    }));
  };

  const handleLayoutChange = (layout: Partial<CourseClosureData['course_layout']>) => {
    setClosureData(prev => ({
      ...prev,
      course_layout: {
        ...prev.course_layout,
        ...layout
      }
    }));
  };
  
  if (loading && !courseData) {
    return <div className="flex justify-center items-center h-64">Loading course data...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Closure</h1>
          <p className="text-muted-foreground">
            Configure closure parameters for {courseData?.programs?.name} at {courseData?.venues?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/events/${courseInstanceId}`)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Closure Data"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Closure Configuration</CardTitle>
          <CardDescription>
            Set the parameters used for this course and record closure information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="info">Course Information</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="parameters">Course Layout</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <CourseInfo 
                info={closureData.course_info} 
                onChange={handleCourseInfoChange} 
              />
            </TabsContent>
            
            <TabsContent value="vehicles">
              <VehicleList 
                vehicles={closureData.vehicles} 
                onChange={handleVehiclesChange} 
              />
            </TabsContent>
            
            <TabsContent value="parameters">
              <CourseLayout 
                layout={closureData.course_layout} 
                onChange={handleLayoutChange} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={loading} className="ml-auto">
            {loading ? "Saving..." : "Save Closure Data"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
