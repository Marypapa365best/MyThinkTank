export const metadata = {
  title: '服务条款与免责声明 · 我的智囊',
}

const LAST_UPDATED = '2026 年 4 月 9 日'

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">服务条款与免责声明</h1>
          <p className="text-white/30 text-sm">最后更新：{LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-white/70 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. 平台性质声明</h2>
            <p>
              「我的智囊」（以下简称「本平台」）是一款基于人工智能技术的思维框架模拟工具。本平台所有智囊角色均基于相关人物公开发表的著作、演讲、访谈等资料构建，旨在模拟其分析视角和思维方式，供学习与决策参考之用。
            </p>
            <div className="mt-3 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-200/60 text-xs leading-relaxed">
              ⚠️ <strong className="text-yellow-200/80">重要：</strong>本平台内所有智囊角色均未经被模拟人物本人或其授权代理人授权、认可或关联。所有输出内容代表 AI 对相关思维框架的模拟，不代表被模拟人物的真实观点或立场。
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. 内容免责声明</h2>
            <p className="mb-3">本平台生成的所有内容：</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                '不构成任何形式的投资建议、财务规划或证券推荐；',
                '不构成法律意见、法律咨询或律师-委托人关系；',
                '不构成医疗诊断、治疗方案或医患关系；',
                '不代表被模拟人物的真实观点，亦不构成对任何产品、服务或机构的背书；',
                '可能存在事实错误、逻辑偏差或信息滞后，用户应独立核实关键信息。',
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-white/25 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">
              用户依据本平台内容做出的任何决策，其结果由用户本人自行承担。本平台不对因使用或依赖平台内容而产生的任何直接或间接损失承担责任。
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. 知识产权说明</h2>
            <p className="mb-3">
              本平台对公开资料的处理方式遵循合理使用（Fair Use）原则：平台提炼的是相关人物的思维逻辑与分析框架（即「思想」），而非对版权作品的逐字复制（即「表达」）。根据著作权法的基本原则，思想、观点、方法和概念本身不受版权保护。
            </p>
            <p className="text-sm">
              若任何权利人认为本平台内容侵犯其合法权益，请通过以下方式联系我们，我们承诺在收到有效投诉后 <strong className="text-white/80">72 小时内</strong>处理：
            </p>
            <div className="mt-2 p-3 rounded-lg bg-white/[0.04] border border-white/8 text-sm">
              投诉邮箱：<a href="mailto:legal@mythinkank.ai" className="text-white/70 hover:text-white transition-colors underline underline-offset-2">legal@mythinkank.ai</a>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. 人格权与公开权</h2>
            <p>
              本平台使用真实人物姓名及其公开信息，仅用于描述性目的（即说明「本工具模拟该人物的思维风格」），不主张任何形式的关联关系或授权背书。本平台明确区分「描述性使用」与「商业背书」，所有内容均附有明确的「思维框架模拟」标注。
            </p>
            <p className="mt-3 text-sm">
              若被模拟人物本人或其合法代理人希望申请移除或建立官方合作，欢迎联系我们探讨认证合作方案。
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. 用户行为规范</h2>
            <p className="mb-3">使用本平台即表示你同意：</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                '不将平台内容用于任何非法目的，包括诈骗、操纵市场或误导他人；',
                '不声称平台生成的内容来自被模拟人物本人；',
                '不将平台内容用于任何形式的商业宣传而不注明其 AI 生成来源；',
                '尊重平台的内容规范，包括不发布政治煽动性、歧视性或仇恨性内容。',
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-white/25 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. 用户自建内容</h2>
            <p>
              用户通过「创建智囊」功能上传的内容，由用户本人对内容的合法性负责。本平台作为内容托管平台，依据 DMCA 及适用法律享有安全港保护。如用户上传内容侵犯第三方权益，本平台收到有效投诉后将予以处理，同时保留对违规账号采取措施的权利。
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. 适用法律与争议解决</h2>
            <p>
              本条款受加利福尼亚州法律管辖，不考虑法律冲突规则。因使用本平台引发的任何争议，双方应首先通过友好协商解决；协商不成的，提交加利福尼亚州有管辖权的法院处理。
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. 条款变更</h2>
            <p>
              本平台保留随时修改本条款的权利。重大变更将通过平台内通知告知用户。继续使用本平台即视为接受修改后的条款。
            </p>
          </section>

          {/* Contact */}
          <section className="pt-4 border-t border-white/8">
            <h2 className="text-base font-semibold text-white mb-3">联系我们</h2>
            <div className="space-y-1 text-sm">
              <p>一般咨询：<a href="mailto:hello@mythinkank.ai" className="text-white/60 hover:text-white transition-colors underline underline-offset-2">hello@mythinkank.ai</a></p>
              <p>法律事务：<a href="mailto:legal@mythinkank.ai" className="text-white/60 hover:text-white transition-colors underline underline-offset-2">legal@mythinkank.ai</a></p>
              <p>内容投诉（72h 响应）：<a href="mailto:legal@mythinkank.ai" className="text-white/60 hover:text-white transition-colors underline underline-offset-2">legal@mythinkank.ai</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
