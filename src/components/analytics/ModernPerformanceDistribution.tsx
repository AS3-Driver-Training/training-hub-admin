
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePerformanceTiers } from "@/services/analyticsService";
import { AnalyticsData } from "@/types/analytics";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ModernPerformanceDistributionProps {
  studentData: AnalyticsData['student_performance_data'];
  content: string;
}

export function ModernPerformanceDistribution({ studentData, content }: ModernPerformanceDistributionProps) {
  const tiers = calculatePerformanceTiers(studentData);
  const total = studentData.length;
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  // Get students for each tier using the actual tier data from the service
  const getTierStudents = (tierName: string) => {
    const tier = tiers.find(t => t.name === tierName);
    if (!tier) return [];
    
    // Extract the min/max values from the tier definition
    let min = 0;
    let max = 100;
    
    if (tierName.includes('85+')) {
      min = 85;
      max = 100;
    } else if (tierName.includes('70-84')) {
      min = 70;
      max = 84.99;
    } else if (tierName.includes('<70')) {
      min = 0;
      max = 69.99;
    }
    
    return studentData
      .filter(student => student.overall_score >= min && student.overall_score <= max)
      .sort((a, b) => b.overall_score - a.overall_score);
  };

  const toggleExpanded = (tierName: string) => {
    setExpandedTier(expandedTier === tierName ? null : tierName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Performance Distribution</CardTitle>
        <div className="text-sm text-gray-600">
          Distribution based on composite scores combining slalom (30%), evasion (30%), and final exercise (40%) performance
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Score Range Labels */}
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-600">&lt;70 Need Training</span>
            <span className="text-yellow-600">70-84 Good Performance</span>
            <span className="text-green-600">85+ Exceptional</span>
          </div>

          {/* Main Horizontal Stacked Bar */}
          <div className="space-y-4">
            <div className="flex h-16 w-full rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
              {tiers.map((tier) => (
                tier.count > 0 && (
                  <div
                    key={tier.name}
                    className="flex flex-col items-center justify-center text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-all duration-200 hover:shadow-lg relative group"
                    style={{
                      backgroundColor: tier.color,
                      width: `${(tier.count / total) * 100}%`,
                    }}
                    onClick={() => toggleExpanded(tier.name)}
                    title={`${tier.name}: ${tier.count} students`}
                  >
                    <div className="text-lg font-bold">{tier.count}</div>
                    <div className="text-xs opacity-90">{tier.percentage}%</div>
                    {tier.count > 0 && (
                      <div className="absolute bottom-1 right-1 opacity-60">
                        {expandedTier === tier.name ? 
                          <ChevronUp className="h-3 w-3" /> : 
                          <ChevronDown className="h-3 w-3" />
                        }
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
            
            {/* Tier Labels Below Bar */}
            <div className="flex text-sm font-medium">
              {tiers.map((tier) => (
                tier.count > 0 && (
                  <div
                    key={`${tier.name}-label`}
                    className="text-center px-2"
                    style={{ 
                      width: `${(tier.count / total) * 100}%`,
                      color: tier.color
                    }}
                  >
                    {tier.name.split(' ')[0]}
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Expandable Student Lists */}
          {tiers.map((tier) => {
            const tierStudents = getTierStudents(tier.name);
            const isExpanded = expandedTier === tier.name;
            
            if (tier.count === 0) return null;
            
            return (
              <div key={`${tier.name}-details`} className="border-l-4 rounded-r-lg overflow-hidden bg-gray-50" style={{ borderLeftColor: tier.color }}>
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                  onClick={() => toggleExpanded(tier.name)}
                >
                  <div>
                    <div className="font-semibold text-lg" style={{ color: tier.color }}>
                      {tier.name}
                    </div>
                    <div className="text-gray-600">
                      {tier.count} student{tier.count !== 1 ? 's' : ''} ({tier.percentage}% of class)
                    </div>
                  </div>
                  {isExpanded ? 
                    <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  }
                </div>
                
                {/* Expanded Student List */}
                {isExpanded && (
                  <div className="border-t bg-white p-4">
                    <div className="grid gap-2">
                      {tierStudents.map((student, index) => (
                        <div key={student.name} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: tier.color }}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-lg font-bold" style={{ color: tier.color }}>
                              {student.overall_score.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">composite score</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary Stats */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h4 className="font-medium text-primary mb-3">Distribution Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Students</div>
                <div className="font-semibold text-gray-900 text-lg">{total}</div>
              </div>
              <div>
                <div className="text-gray-600">Ready for Operations (≥85)</div>
                <div className="font-semibold text-green-600 text-lg">
                  {tiers.find(t => t.name.includes('Exceptional'))?.count || 0} students
                </div>
              </div>
              <div>
                <div className="text-gray-600">Need Additional Training (&lt;70)</div>
                <div className="font-semibold text-red-600 text-lg">
                  {tiers.find(t => t.name.includes('Needs Training'))?.count || 0} students
                </div>
              </div>
              <div>
                <div className="text-gray-600">Group Readiness Rate</div>
                <div className="font-semibold text-tertiary text-lg">
                  {Math.round(((tiers.find(t => t.name.includes('Exceptional'))?.count || 0) + 
                              (tiers.find(t => t.name.includes('Good Performance'))?.count || 0)) / total * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none border-t pt-4">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
