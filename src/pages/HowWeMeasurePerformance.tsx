
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HowWeMeasurePerformance() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Navigation */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">How We Measure Performance</h1>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Understanding Your Driving Course Performance Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700">
            Welcome to the performance evaluation guide for our Advanced Driver Training courses. This guide is designed to help you understand how your driving skills are assessed during training.
          </p>
          
          <div>
            <h3 className="text-xl font-semibold text-primary mb-3">Overview of Evaluation Areas</h3>
            <p className="text-gray-700 mb-4">During the training, your driving skills are evaluated in three main areas:</p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-primary mb-2">1. Slalom Exercise</h4>
                <p className="text-sm text-gray-700">
                  This involves maneuvering through a 4 cone, constant radius slalom at a consistent speed generating lateral forces at 80% or more of the vehicle's design capability, testing your ability to navigate turns smoothly and maintain control of the vehicle.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-tertiary">
                <h4 className="font-semibold text-tertiary mb-2">2. Emergency Lane Change Maneuver (Barricade Exercise)</h4>
                <p className="text-sm text-gray-700">
                  This involves navigating around an obstruction by changing lanes and then reverting to the original lane, all while maintaining a constant speed and exerting energy that surpasses 80% of the vehicle's cornering potential. This exercise introduces greater cognitive loads and measures reaction times.
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-secondary">
                <h4 className="font-semibold text-secondary mb-2">3. Final Multidisciplinary Exercise</h4>
                <p className="text-sm text-gray-700">
                  This thorough test, modeled after a complex autocross, incorporates aspects like reverse slalom, forward slalom, and emergency lane change from the curriculum, along with extra complications to evaluate a driver's complete skill set in different situations. The exercise gauges success by comparing times against an optimal benchmark, factoring in the driver's control during maneuvers and time spent reversing.
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-700 italic">
                The exercise is conducted with varying degrees of induced stress, tailored to the driver's level of experience and competence, in order to foster stress inoculation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">How We Score Your Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700">Your performance in each area is scored using several key metrics:</p>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">1. Efficiency of Completing Exercises (Normalized Runs Until Pass)</h4>
              <p className="text-gray-700 mb-2">
                We look at how many attempts it takes for you to successfully complete an exercise. Fewer attempts result in a higher score. If you don't manage to pass the exercise, this score will be low.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Example:</strong> If it takes you 10 tries to pass the slalom, your score for efficiency would be lower than if you passed it in 2 tries.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">2. Control and Precision (Control Scores)</h4>
              <p className="text-gray-700 mb-2">
                We measure how well you control the vehicle during the exercises. If your control is excellent (above 80%), you'll score high. If it's below 80%, your score will be reduced to reflect areas needing improvement.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Example:</strong> A control score of 75% would be reduced, reflecting the need to enhance vehicle control skills.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">3. Performance in the Final Exercise</h4>
              <p className="text-gray-700 mb-2">
                This score is influenced by how well you handle the combined challenges of the final exercise, including how you manage stress. Penalties for mistakes like hitting cones are subtracted from your score.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Example:</strong> Doing well under stress can boost your score, while penalties for errors will reduce it.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Composite Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Final Composite Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Your final score is a combination of your scores from the slalom, lane change, and final exercises. Each area contributes to your overall performance score, which determines how well you've mastered the skills taught in the course.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-3">Calculating Your Overall Score:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• <strong>Slalom and Lane Change Scores</strong> each contribute 30%</li>
              <li>• <strong>The Final Exercise Score</strong> contributes 40%</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Score Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">What Your Score Means</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="font-semibold text-green-800 w-24">Above 90%:</div>
              <div className="text-green-700">You're excelling in your driving skills, demonstrating high proficiency.</div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="font-semibold text-blue-800 w-24">80% to 90%:</div>
              <div className="text-blue-700">You're doing well but there's room for improvement in specific areas.</div>
            </div>
            
            <div className="flex items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div className="font-semibold text-red-800 w-24">Below 80%:</div>
              <div className="text-red-700">Additional training is needed to ensure safety and skill proficiency.</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mathematical Model */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Mathematical Model for Performance Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">1. Normalized Runs Until Pass</h4>
            <p className="text-gray-700 mb-3">
              This score evaluates the number of attempts needed to pass each exercise. Fewer attempts yield a higher score, reflecting better efficiency and skill.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
              Normalized Runs Until Pass = max(50, 100 - 5 × (Runs Until Pass - 2))
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">2. Control Scores</h4>
            <p className="text-gray-700 mb-3">
              This metric assesses how well the vehicle is controlled during the exercises. High control scores indicate excellent handling skills.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-mono text-sm mb-2">
                Control Score = Score (if Score ≥ 80) OR Score × (Score/80) (if Score &lt; 80)
              </div>
              <p className="text-sm text-gray-600">
                This adjustment penalizes scores below 80%, underscoring the need for greater control.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">3. Overall Composite Score</h4>
            <p className="text-gray-700 mb-3">
              The final score combines results from all exercises, weighted to emphasize the comprehensive skills tested in the final exercise.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
              Overall Composite Score = (0.3 × Slalom Composite) + (0.3 × Lane Change Composite) + (0.4 × Final Exercise Score)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conclusion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Conclusion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Our goal is to provide you with clear, actionable feedback on your driving skills. Understanding these scores helps you identify where you excel and where you might need more practice. Whether you're reviewing your own scores or those of your team, this guide should help you interpret the results effectively.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
