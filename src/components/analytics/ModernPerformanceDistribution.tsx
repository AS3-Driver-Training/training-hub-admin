
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

  // Get students for each tier
  const getTierStudents = (tierName: string) => {
    const tierRanges = {
      'Exceptional (90+)': { min: 90, max: 100 },
      'Proficient (85-89)': { min: 85, max: 89 },
      'Developing (70-84)': { min: 70, max: 84 },
      'At Risk (<70)': { min: 0, max: 69 }
    };
    
    const range = tierRanges[tierName as keyof typeof tierRanges];
    if (!range) return [];
    
    return studentData
      .filter(student => student.overall_score >= range.min && student.overall_score <= range.max)
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
          Overall composite scores combining slalom (30%), evasion (30%), and final exercise (40%) performance
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Score Range Labels */}
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span className="text-red-600">&lt;70 Need Training</span>
            <span className="text-yellow-600">70-84 Developing</span>
            <span className="text-blue-600">85-89 Proficient</span>
            <span className="text-green-600">90+ Excellent</span>
          </div>

          {/* Horizontal Stacked Bar */}
          <div className="space-y-2">
            <div className="flex h-12 w-full rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
              {tiers.map((tier) => (
                tier.count > 0 && (
                  <div
                    key={tier.name}
                    className="flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: tier.color,
                      width: `${(tier.count / total) * 100}%`,
                    }}
                    onClick={() => toggleExpanded(tier.name)}
                    title={`${tier.name}: ${tier.count} students (${tier.percentage}%)`}
                  >
                    {tier.count > 0 && (
                      <span className="flex items-center gap-1">
                        {tier.count}
                        {tier.count > 0 && (
                          expandedTier === tier.name ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                )
              ))}
            </div>
            
            {/* Percentage Labels Below Bar */}
            <div className="flex text-xs text-gray-500">
              {tiers.map((tier) => (
                tier.count > 0 && (
                  <div
                    key={`${tier.name}-label`}
                    className="text-center"
                    style={{ width: `${(tier.count / total) * 100}%` }}
                  >
                    {tier.percentage}%
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Tier Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => {
              const tierStudents = getTierStudents(tier.name);
              const isExpanded = expandedTier === tier.name;
              
              return (
                <div key={tier.name} className="border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderLeftColor: tier.color, borderLeftWidth: '4px' }}
                    onClick={() => toggleExpanded(tier.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{tier.name.split(' ')[0]}</div>
                        <div className="text-sm text-gray-600">{tier.name.split(' ').slice(1).join(' ')}</div>
                        <div className="text-lg font-bold mt-1" style={{ color: tier.color }}>
                          {tier.count} ({tier.percentage}%)
                        </div>
                      </div>
                      {tier.count > 0 && (
                        isExpanded ? 
                          <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Student List */}
                  {isExpanded && tier.count > 0 && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="space-y-2">
                        {tierStudents.map((student) => (
                          <div key={student.name} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-900">{student.name}</span>
                            <span className="text-gray-600 font-mono">
                              {student.overall_score.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h4 className="font-medium text-primary mb-2">Distribution Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Students</div>
                <div className="font-semibold text-gray-900">{total}</div>
              </div>
              <div>
                <div className="text-gray-600">Above Proficient (≥85%)</div>
                <div className="font-semibold text-blue-600">
                  {tiers.find(t => t.name.includes('Exceptional'))?.count || 0 + 
                   tiers.find(t => t.name.includes('Proficient'))?.count || 0} students
                </div>
              </div>
              <div>
                <div className="text-gray-600">Need Additional Training</div>
                <div className="font-semibold text-red-600">
                  {tiers.find(t => t.name.includes('At Risk'))?.count || 0} students
                </div>
              </div>
              <div>
                <div className="text-gray-600">Group Proficiency Rate</div>
                <div className="font-semibold text-tertiary">
                  {Math.round(((tiers.find(t => t.name.includes('Exceptional'))?.count || 0) + 
                              (tiers.find(t => t.name.includes('Proficient'))?.count || 0) + 
                              (tiers.find(t => t.name.includes('Developing'))?.count || 0)) / total * 100)}%
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
