@@ .. @@
                       {/* Project type badge */}
                       {startsnap.type === "live" ? (
                         <Badge className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5 flex items-center gap-1">
                           <span className="material-icons text-xs">rocket_launch</span>
                           Live Project
                         </Badge>
                       ) : (
                         <Badge className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-yellow-700 px-2 py-0.5 flex items-center gap-1">
                           <span className="material-icons text-xs">lightbulb</span>
                           Idea
                         </Badge>
                       )}
                       
                       {/* Hackathon badge */}
                       {startsnap.is_hackathon_entry && (
                         <Badge className="bg-startsnap-heliotrope text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-purple-700 px-2 py-0.5 flex items-center gap-1">
                           <span className="material-icons text-xs">emoji_events</span>
                           Hackathon Entry
                         </Badge>
                       )}
                     </div>
 
                     <div className="flex justify-between items-start">
                       <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8 flex-1">
                         {startsnap.name}
                       </h3>
                       <Badge
-                        className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-[13px] py-[5px] font-['Space_Mono',Helvetica] font-normal text-sm`}
+                        className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-[13px] py-[5px] font-['Space_Mono',Helvetica] font-normal text-sm hover:opacity-90 hover:-translate-y-px transition-all duration-200`}
                       >
                         {categoryDisplay.name}
                       </Badge>
@@ .. @@
                             {startsnap.tags.slice(0, 2).map((tag, idx) => (
                               <Badge 
                                 key={`tag-${idx}`}
-                                className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5"
+                                className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5 hover:opacity-90 hover:-translate-y-px transition-all duration-200"
                               >
                                 #{tag}
                               </Badge>
                             ))}
                             {startsnap.tags.length > 2 && (
-                              <Badge className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5">
+                              <Badge className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5 hover:opacity-90 hover:-translate-y-px transition-all duration-200">
                                 +{startsnap.tags.length - 2} more
                               </Badge>
                             )}
@@ .. @@
                             {startsnap.tools_used.slice(0, 2).map((tool, idx) => (
                               <Badge 
                                 key={`tool-${idx}`}
-                                className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-0.5"
+                                className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-0.5 hover:opacity-90 hover:-translate-y-px transition-all duration-200"
                               >
                                 {tool}
                               </Badge>
                             ))}
                             {startsnap.tools_used.length > 2 && (
-                              <Badge className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-0.5">
+                              <Badge className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-0.5 hover:opacity-90 hover:-translate-y-px transition-all duration-200">
                                 +{startsnap.tools_used.length - 2} more
                               </Badge>
                             )}
@@ .. @@
                             {startsnap.feedback_tags.slice(0, 2).map((feedback, idx) => (
                               <Badge 
                                 key={`feedback-${idx}`}
-                                className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5"
+                                className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5 hover:opacity-90 hover:-translate-y-px transition-all duration-200"
                               >
                                 {feedback}
                               </Badge>
                             ))}
                             {startsnap.feedback_tags.length > 2 && (
-                              <Badge className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5">
+                              <Badge className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5 hover:opacity-90 hover:-translate-y-px transition-all duration-200">
                                 +{startsnap.feedback_tags.length - 2} more
                               </Badge>
                             )}