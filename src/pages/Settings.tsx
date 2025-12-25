import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Brain, Shield, Database, Zap } from "lucide-react";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { AIPreferencesSection } from "@/components/settings/AIPreferencesSection";
import { AccountSection } from "@/components/settings/AccountSection";
import { DataSection } from "@/components/settings/DataSection";
import { TokenUsageSection } from "@/components/settings/TokenUsageSection";
import { TokenAutomationGuide } from "@/components/settings/TokenAutomationGuide";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1">설정</h1>
        <p className="text-muted-foreground">
          계정 정보와 환경 설정을 관리하세요.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">프로필</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">사용량</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI 설정</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">계정</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">데이터</span>
          </TabsTrigger>
        </TabsList>

        {/* 프로필 섹션 */}
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>프로필 정보</CardTitle>
              <CardDescription>
                기본 프로필 정보를 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 토큰 사용량 섹션 */}
        <TabsContent value="usage" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>토큰 사용량</CardTitle>
              <CardDescription>
                AI 실행에 사용되는 토큰 사용량을 확인하고 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TokenUsageSection />
            </CardContent>
          </Card>

          {/* 자동화 안내 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>토큰 자동 관리 시스템</CardTitle>
              <CardDescription>
                토큰 사용량을 자동으로 관리하고 모니터링하는 시스템에 대해 안내합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TokenAutomationGuide />
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI 설정 섹션 */}
        <TabsContent value="ai" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI 환경 설정</CardTitle>
              <CardDescription>
                AI 실행 시 사용할 기본 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIPreferencesSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 계정 관리 섹션 */}
        <TabsContent value="account" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>계정 관리</CardTitle>
              <CardDescription>
                계정 보안 및 인증 정보를 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 데이터 관리 섹션 */}
        <TabsContent value="data" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>데이터 관리</CardTitle>
              <CardDescription>
                저장된 데이터를 관리하고 내보낼 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
